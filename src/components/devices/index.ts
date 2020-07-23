//import path = require("path");
import { EventEmitter } from "events";
import mongoose = require("mongoose");
//@ts-ignore
import logger = require("../../logger"); //`${__dirname}/../../logger/index.js`
import { IDevice } from "../../database/model.devices";
import Hooks = require("../../system/hooks");

/**
 * @module devices
 * @namespace devices
 */


//@ts-ignore
const log = logger.create("devices");
const events = new EventEmitter();
const model = mongoose.model("Devices");
//@ts-ignore
const hooks = new Hooks();
const list = new Map();
//const init = false;



//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events,
    // refresh method here ?!
    // würde sinn machen
    // siehe Object.assign
};


const prototype = Object.create(COMPONENT);

Object.assign(prototype, {
    list
});

module.exports = Object.assign(prototype, {
    //list,
    add,
    get,
    disable,
    enable,
    update,
    fetch,
    remove,
    refresh
});


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


/**
 * Update device & endpoints based on device with <data>
 * @param {string|ObjectID} _id Device id
 * @param {object} data 
 * @param {function} cb Callback
 * @fires updateDeviceTree [hook]
 * @private
 */
function updateDeviceTree(_id, data, cb) {
    hooks.trigger("updateDeviceTree", _id, data, () => {
        model.findOne({
            _id
        }, (err, device) => {

            if (err) {
                log.error(err, "Could not find device");
                cb(err);
                return;
            }

            if (!device) {
                cb(new Error("DEVICE_NOT_FOUND"));
                return;
            }

            device.updateOne(data, (err, result) => {

                if (err) {
                    log.error(err, "Could not update device document");
                    cb(err);
                    return;
                }

                // feedback
                log.verbose("Device doc (%s) updated endpoints, %j", _id, data);


                if (!result.ok) {
                    log.warn("Could not update device document, result.ok = false");
                    return;
                }

                // update device endpoints
                mongoose.model("Endpoints").find({
                    device: _id
                    //@ts-ignore
                }).updateMany(data, (err, result) => {

                    if (err) {
                        log.error(err, "Could not update device endpoints");
                        cb(err);
                        return;
                    }

                    // update done
                    cb(null, Boolean(result.ok));

                });



            });


        });

    });
}


/**
* Remove device & endpoints docs
* @param {string} _id device id
* @param {function} [cb] callback if not passed, a promise is returned
* @fires remove [hook]
* @returns {(Promise|undefined)} Returns a promise if no callback is passed
*/
function remove(_id, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("remove", _id, () => {

            model.find({
                _id
            }).exec((err, doc: IDevice) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not delete device: %s", err.message);

                    reject(err);
                    return;

                }

                if (!doc) {

                    // feedback
                    log.debug("Device '%s' not found", _id);

                    reject(new Error("DEVICE_NOT_FOUND"));
                    return;

                }

                // feedback
                log.verbose("Device %s from database remove, delete endpoint documents");

                // remove device endpoints
                mongoose.model("Endpoints").deleteMany({
                    device: _id
                }, function (err) {

                    if (err) {

                        // feedback
                        log.error(err, "Could not remove device documents for device '%s' (%s)", doc.name, _id);

                        reject(err);
                        return;

                    }

                    events.emit("removed", doc);
                    resolve(doc);

                });

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


/**
 * Update device
 * @param {string} _id Device ID
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

            model.findOne({
                _id
            }, (err, doc) => {

                if (err) {
                    log.error(err, "Could not update device: %s", err.message);
                    reject(err);
                    return;
                }

                // update fetched doc
                doc.update(data, (err, result) => {

                    if (err) {
                        log.error(err, "Could not update device: %s", err.message);
                        reject(err);
                        return;
                    }

                    // feedback
                    log.debug("Updated device %s, %j", _id, data, result);
                    events.emit("updated", doc);
                    resolve(doc);

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
 * Disable device and all device endpoints
 * @param {(string|ObjectID)} _id ObjectId
 * @param {function} [cb] Callback
 * @fires disable [hook]
 * @fires disabled [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function disable(_id, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("disable", _id, () => {

            updateDeviceTree(_id, {
                enabled: false
            }, (err, ok) => {

                if (err || !ok) {
                    reject(err || ok);
                    return;
                }

                events.emit("disabled", _id, ok);
                //hooks.trigger("disabled", _id, ok, cb);

                resolve(_id);

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
 * Enable device and all device endpoints
 * @param {(string|ObjectID)} _id ObjectId
 * @param {function} cb Callback
 * @fires enable [hook]
 * @fires enabled [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function enable(_id, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("enable", _id, () => {
            updateDeviceTree(_id, {
                enabled: true
            }, (err, ok) => {

                if (err || !ok) {
                    reject(err || ok);
                    return;
                }

                events.emit("enabled", _id, ok);
                //hooks.trigger("enabled", _id, ok, cb);

                resolve(_id);

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
 * Refresh device array
 * @param {function} [cb] Callback
 * @fires refresh [hook]
 * @fires refreshed [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function refresh(cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("refresh", list, () => {

            // cleanup devices array
            list.clear();

            model.find({
                //enabled: true
            }).lean().exec((err, docs: Array<IDevice>) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not fetch devices from database");

                    reject(err);
                    return;

                }

                docs.forEach((device) => {
                    list.set(device._id, device);
                });

                // feedback
                log.debug("Device list refreshed!");
                events.emit("refreshed", docs);

                resolve(docs);

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
* Fetch docs from database
* @param {object} filter filter object
* @param {boolean} [lean] Lean mongoose query
* @param {function} [cb] callback
* @fires fetch [hook]
* @fires fetched [event]
* @returns {(Promise|undefined)} Returns a promise if no callback is passed
*/
function fetch(filter, lean, cb) {

    if (typeof (lean) === "function") {
        cb = lean;
        lean = true;
    }

    if (!lean && !cb) {
        lean = true;
    }

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("fetch", filter, lean, () => {

            // build query
            let query = model.find(filter);

            if (lean) {
                query.lean();
            }

            // execute query
            query.exec((err, docs) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not fetch docs from database, %j", err.message, filter);

                    reject(err);
                    return;

                }

                resolve(docs);
                events.emit("fetched", docs, filter);

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


/**
* Add device to database
* @param {object} data device object
* @param {string} data.name Device name
* @param {string} data.icon Device icon
* @param {string|ObjectID} data.room Device room ObjectID
* @param {boolean} data.enabled is device activated
* @param {array} data.interfaces Device interfaces @see {@link interfaces}
* @param {object} data.meta Meta information
* @param {string} data.meta.manufacturer Manufacturer
* @param {string} data.meta.model Model name
* @param {string} data.meta.web Device Webiste
* @param {number} data.meta.revision Revision number
* @param {function} [cb] callback
* @fires add [hook]
* @fires added [event]
* @returns {(Promise|undefined)} Returns a promise if no callback is passed
*/
function add(data, cb) {

    // wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("add", data, () => {

            // save model
            new model(data).save((err, doc) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not add new device doc, %j: %s", data, err.message);

                    reject(err);
                    return;

                }

                // feedback
                log.info("Device %s added to databse: %j", doc._id, doc);

                // done
                resolve(doc);
                events.emit("added", doc);

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



/**
 * Component factory
 */
function factory() {

    // cleanup
    list.clear();

    model.find({
        //enabled: true
    }).lean().exec((err, docs: Array<IDevice>) => {

        if (err) {
            log.error(err, "Could not fetch devices from database");
            process.exit();
        }

        docs.forEach((device) => {
            list.set(device._id, device);
        });

        log.debug("%d device(s) fetched from database", docs.length);
        log.info("Component initialized");


        COMPONENT.ready = true;
        events.emit("ready");

    });

}

factory();