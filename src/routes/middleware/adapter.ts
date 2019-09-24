import { EventEmitter } from 'events';
import { model, Types } from 'mongoose';
import { IRequest } from "../api.interfaces";
import * as Express from "express";

function checkObjectIdValid(id: any): Boolean {
    if (Types.ObjectId.isValid(id)) {
        if (new Types.ObjectId(id) == id) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


const logger = require("../../logger/index.js");

//TODO need 2 logger:
// 1. Middleware itself
// 2. Adapter instance

module.exports = () => {
    return (
        req: IRequest,
        res: Express.Response,
        next: Function
    ) => {

        // feedback
        logger.verbose("[adapter-bootstrap] Adapter middleware called");

        const { adapter } = req.states;

        if (!adapter.has(req.params.iface)) {

            // feebdack
            logger.debug("[adapter-bootstrap] create adapter instance for interface: %s", req.params.iface);

            //FIXME use req.interface ?
            const iface = req.doc.interfaces.find(e => {
                return e._id == req.params.iface;
            });


            const fetch = (async () => {
                if (checkObjectIdValid(iface.adapter)) {

                    return await model("Adapters").findById(iface.adapter).lean();

                } else {

                    return iface.adapter;

                }
            });


            fetch().then((doc) => {

                // doc = adapter model
                if (!adapter.has(doc._id)) {
                    try {

                        //feedback
                        logger.debug("Init adapter: %s", doc.folder);

                        // create logger & init adapter
                        // singleton adapter instance for multiple interface
                        const log = logger.create(doc.folder);
                        const instance = require(`../../adapter/${doc.folder}/index.js`)(log);

                        // set/save adapter instance
                        adapter.set(doc._id, instance);
                        return Promise.resolve(doc._id);

                    } catch (e) {

                        if (e.code === "ENOENT") {

                            logger.error(e, "[adapter-bootstrap] ADAPTER NOT FOUND for interface", req.params.iface);
                            res.status(500).end(e.message);

                        } else {

                            logger.error(e, "[adapter-bootstrap] Error in adapter\n", e.message);
                            res.status(500).end(e.message);

                        }

                        return Promise.reject(e);

                    }
                } else {

                    return Promise.resolve(doc._id);

                }

            }).then((id) => {

                // get adapter instance
                const instance = adapter.get(id);

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

                //@ts-ignore
                instance(input, output, iface, device, req.states);
                adapter.set(req.params.iface, req.adapter);

                next();

            }).catch((e) => {

                //NOTE needed?!
                //logger.error(e);

            });


        } else {

            // feebdack
            logger.verbose("[adapter-bootstrap] use existing adapter instance for interface: %s", req.params.iface);

            req.adapter = adapter.get(req.params.iface);
            next();

        }

    };
};