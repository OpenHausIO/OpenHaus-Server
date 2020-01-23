import { EventEmitter } from "events";
import { model, Types } from "mongoose";
import { IRequest } from "../device.interfaces";
import * as Express from "express";
import * as Winston from "winston";

// FIXME
// NOTE file/route obsulete ?

function checkObjectIdValid(id: any): Boolean {
    try {

        if (Types.ObjectId.isValid(id)) {
            if (new Types.ObjectId(id) == id) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    } catch (e) {
        console.log("adsfasdf", e);
    }
}


const logger = require("../../logger/index.js");
const states = require("../states.js");

const { adapter } = states;


/**
 * 
 * ADAPTER INIT MIDDLEWARE
 * 
 */

module.exports = (log: Winston.Logger) => {
    return (
        req: IRequest,
        res: Express.Response,
        next: Function
    ) => {

        // feedback
        log.verbose("Middleware called");


        if (!states.adapter.has(req.params.iface)) {

            // feebdack
            //log.debug("Create adapter instance for interface: %s", req.params.iface);

            //FIXME use req.interface ?
            const iface = req.doc.interfaces.find(e => {
                return e._id == req.params.iface;
            });

            //NOTE could be possible if adapter is not required in db model
            if (!iface.adapter) {
                return log.error("Interface (%s) has no adapter set!", iface._id);
            }

            const fetch = (async () => {
                if (checkObjectIdValid(iface.adapter)) {

                    log.verbose("Fetch adapter doc from database (%s)", iface.adapter);
                    return await model("Adapters").findById(iface.adapter).lean();

                } else {

                    log.verbose("Use poluated adapter doc", iface);
                    return iface.adapter;

                }
            });


            fetch().then((doc) => {

                if (!doc) {
                    return log.notice("Document is empty!");
                }

                // feedback
                log.verbose("Adapter doc: %j", doc);

                // doc = adapter model
                if (!adapter.has(doc._id)) {
                    try {

                        //feedback
                        log.info("Init adapter: %s", doc.folder);

                        // create logger & init adapter
                        // singleton adapter instance for multiple interface
                        const exported = require(`../../adapter/${doc.folder}/index.js`);
                        const instance = exported(logger.create(`adapter/${doc.folder}`));

                        // set/save adapter instance
                        adapter.set(doc._id, instance);
                        return Promise.resolve(doc);

                    } catch (e) {

                        if (e.code === "ENOENT") {

                            log.warn(e, "Adapter '%s' not found, interface: %s", doc.folder, req.params.iface);
                            res.status(500).end(e.message);

                        } else {

                            log.error(e, "Error in adapter\n", e.message);
                            res.status(500).end(e.message);

                        }

                        return Promise.reject(e);

                    }
                } else {

                    return Promise.resolve(doc);

                }

            }).then((doc) => {

                // feedback
                log.debug("(%s) Create/init handler for interface: %s", doc.folder, doc._id);

                // get adapter instance
                const instance = adapter.get(doc._id);

                // create event emitter for adapter
                const emitterInput = new EventEmitter();
                const emitterOutput = new EventEmitter();
                const emitterIface = new EventEmitter();
                const emitterDevice = new EventEmitter();

                //NOTE funktioniert nur weil doc = mongoose document
                //mit .lean funkioniert das nicht mehr!
                //Object.assign(req.doc, emitterDevice)
                const { input, output, iface, device } = req.adapter = {
                    input: emitterInput,
                    output: emitterOutput,
                    iface: Object.assign(req.interface, emitterIface),
                    device: Object.assign(req.doc, emitterDevice)
                };

                instance(input, output, iface, device, states);
                adapter.set(req.params.iface, req.adapter);

                next();

            }).catch((e) => {

                // someday someone should look
                log.error(e, "Adapter Blabla...");

            });


        } else {

            // feebdack
            log.verbose("Use existing adapter instance for interface: %s", req.params.iface);

            req.adapter = adapter.get(req.params.iface);
            next();

        }

    };
};