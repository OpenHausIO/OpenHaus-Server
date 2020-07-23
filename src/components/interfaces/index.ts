import { EventEmitter } from "events";
import * as logger from "../../logger/index.js";
//import { IDevice, IInterface } from '../../database/model.devices.js';
import Hooks = require("../../system/hooks");
//@ts-ignore
import * as listtream from "../adapter/node_modules/interface-stream";
import mongoose = require("mongoose");
import { IDevice, IInterface } from "../../database/model.devices.js";
//import { ObjectID } from "bson";
const interfaceStream = require("interface-stream");

//const CDEVICES = require("../devices");
const model = mongoose.model("Devices");

//@ts-ignore
const log = logger.create("interfaces");
const events = new EventEmitter();
//@ts-ignore
const hooks = new Hooks();



// store
const list = new Map();


//@ts-ignore
const COMPONENT = {
    ready: false,
    hooks,
    events
};

const prototype = Object.create(COMPONENT);
module.exports = Object.assign(prototype, {
    list,
    update,
    add,
    get,
    remove,
    settings
});

function add(_id, data, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("add", data, () => {

            model.findByIdAndUpdate(_id, {
                $push: {
                    interfaces: data
                }
            }, (err, result) => {

                if (err) {
                    log.warn(err, "Could not add interface to device '%s':", _id, err);
                    reject(err);
                    return;
                }

                events.emit("added", result);
                resolve(result);

            });


        });
    });

    if (!cb) {
        return prom;
    }

    // callback
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);
}


function get(_id, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("get", _id, () => {

            if (list.has(_id)) {

                resolve(list.get(_id));
                events.emit("getted", _id);

            } else {

                resolve(null);

            }

        });
    });

    if (!cb) {
        return prom;
    }

    // callback
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);

}


function remove(_id, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("remove", _id, () => {

            events.emit("removed", _id);

        });
    });

    if (!cb) {
        return prom;
    }

    // callback
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);
}


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
        hooks.trigger("update", _id, data, () => {


            mongoose.model("Devices").find({
                $in: {
                    interfaces: {
                        _id
                    }
                }
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
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);

}


/**
 * Change settings on interface
 * @param {string} _id 
 * @param {object} data
 * @param {function}  cb
 * @fires settings [hook]
 * @fires settings [event]
 */
function settings(_id, data, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("settings", _id, data, () => {


            //TODO

        });
    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);

}




setImmediate(() => {

    list.clear();

    // fetch docs from database
    mongoose.model("Devices").find({}).lean().exec((err, devices) => {

        if (err) {

            // feedback
            log.error(err, "Could not fetch devices, cant do anything!", err.message);
            return;

        }

        if (!devices) {
            log.warn("No devices found, nothing to do!");
            return;
        }

        devices.map((device: IDevice) => {
            return device.interfaces;
            //@ts-ignore
        }).flat().forEach((iface: IInterface) => {

            // create duplex interface
            let stream = new interfaceStream(iface, {
                // duplex stream options
            });

            list.set(iface._id, stream);

        });



        // feedback
        log.info("Component initialized");

        COMPONENT.ready = true
        events.emit("ready");

    });


});