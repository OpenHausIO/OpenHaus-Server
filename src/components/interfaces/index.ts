import { EventEmitter } from "events";
import * as logger from "../../logger/index.js";
import { IDevice } from '../../database/model.devices.js';
import Hooks = require("../../system/hooks");
//@ts-ignore
import * as InterfaceStream from "interface-stream";
import mongoose = require("mongoose");
//import { ObjectID } from "bson";

const CDEVICES = require("../devices");

//@ts-ignore
const log = logger.create("interfaces");
const events = new EventEmitter();
//@ts-ignore
const hooks = new Hooks();

export interface CIInterface extends InterfaceStream {

}


export interface CINTERFACES extends EventEmitter {
    ready: Boolean,
    INTERFACES: Map<String, Object>
};



const INTERFACES: Map<String, InterfaceStream> = new Map();

/*
module.exports = Object.assign(events, {
    
    isReady: false,
    factory
});
*/


//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};


module.exports = {
    INTERFACES,
    update,
    settings,
    __proto__: COMPONENT,
    prototype: COMPONENT
};




/**
 * Update device
 * @param {string} _id Interface ID
 * @param {object} data 
 * @param {function} [cb] Callback
 * @fires update [hook]
 * @fires updated [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function update(_id, data, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.emit("update", _id, data, () => {


            mongoose.model("Devices").find({
                interface: _id
            }).exec((err, doc) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not update device interface", err.message);

                    reject(err);
                    return;

                }

                if (!doc) {
                    log.warn("Interface '%s' not found", _id);
                    reject(new Error("INTERFACE_NOT_FOUND"));
                    return;
                }

                //@ts-ignore
                doc.update(data, (err, result) => {

                    if (err) {

                        // feedback
                        log.error("Could not update document: %j", data);

                        reject(err);
                        return;
                    }

                    if (!result.ok) {

                        // feedback
                        log.warn("Update returned not ok, %j", result);

                        reject(new Error("UPDATE_NOT_OK"));
                        return;

                    }

                    // feedback
                    log.verbose("Interface (%s) updated: %j", _id, data);

                    events.emit("updated", _id, data);
                    resolve(Boolean(result.ok));

                });

            });

        });
    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(cb).catch(cb);

}


/**
 * Change settings on interface
 * @param _id 
 * @param settings 
 * @fires settings [hook]
 * @fires settings [event]
 */
function settings(_id, data, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.emit("settings", _id, data, () => {

            update(_id, {
                $set: data
            }, (err, result) => {

                if (err) {
                    log.error(err, "Could not change settings: %s", err.message);
                    reject(err);
                    return;
                }

                // done
                events.emit("settings", _id, data);
                resolve(Boolean(result.ok));

            });

        });
    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(cb).catch(cb);

}


/**
 * Component factory
 */
function factory() {

    // cleanup
    INTERFACES.clear();

    CDEVICES.DEVICES.forEach((device: IDevice) => {
        if (device.enabled) {

            // feedback
            log.debug("Handle interfaces for device '%s'", device.name);

            // create duplex stream
            // for each device interface
            device.interfaces.forEach((iface) => {

                let duplex = new InterfaceStream({
                    // duplex options
                });

                Object.assign(duplex, iface);
                INTERFACES.set(String(iface._id), duplex);

                // feedback
                log.verbose("Duplex Stream Interface created for interface: %s", duplex._id);

            });

        } else {

            // feedback
            log.debug("Ingore device '%s' (%s), not enabled", device.name, device._id)

        }
    });

    // feedback
    log.info("Component initialized");

    COMPONENT.ready = true
    events.emit("ready");

}


if (!CDEVICES.ready) {
    CDEVICES.events.on("ready", () => {
        factory();
    });
} else {
    factory();
}