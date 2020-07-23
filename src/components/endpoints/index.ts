import { EventEmitter } from "events";
import * as mongoose from "mongoose";
import * as logger from "../../logger/index.js";
import { IEndpoint, ICommand } from '../../database/model.endpoints';
import Hooks = require("../../system/hooks");

//import C_ADAPTER = 


//@ts-ignore
const log = logger.create("endpoints");
const events = new EventEmitter();

//@ts-ignore
const hooks = new Hooks();

import C_ADAPTER = require("../adapter");
import C_INTERFACES = require("../interfaces");


const model = mongoose.model("Endpoints");


const list = new Map();
const interfaceCommands = new Map();
const commanderInstances = new Map();

//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};

const protoype = Object.create(COMPONENT);
module.exports = Object.assign(protoype, {
    list,
    remove,
    update,
    disable,
    enable,
    fetch,
    add,
    clean,
    get,
    refresh,
});


const Commander = require("./commander")(log);

const Endpoint = require("./endpoint")(log, {
    commanderInstances,
    interfaceCommands,
    Commander
});



/**
* Remove endpoint
* @param {string} _id Endpoint id
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
            }).exec((err, doc) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not delete endpoint: %s", err.message);

                    reject(err);
                    return;

                }

                if (!doc) {

                    // feedback
                    log.debug("'%s' not found", _id);

                    reject(new Error("DEVICE_NOT_FOUND"));
                    return;

                }

                // feedback
                log.verbose("Endpoint %s from database remove, delete endpoint documents");

                events.emit("removed", _id);
                resolve(_id);

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
 * Update endpoint
 * @param {string} _id Endpoint ID
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
                    log.error(err, "Could not update endpoint: %s", err.message);
                    reject(err);
                    return;
                }

                // update fetched doc
                doc.update(data, (err, result) => {

                    if (err) {
                        log.error(err, "Could not update endpoint: %s", err.message);
                        reject(err);
                        return;
                    }

                    // feedback
                    log.debug("Updated endpoint %s, %j", _id, data, result);
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
 * Disable endpoint
 * @param {(string|ObjectID)} _id ObjectId
 * @param {function} [cb] Callback
 * @fires disable [hook]
 * @fires disabled [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function disable(_id, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("disable", _id, () => {

            model.updateOne(_id, {
                $set: {
                    enabled: false
                }
            }, (err, result) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not disable endpoint: %s", err.message);

                    reject(err);

                }

                events.emit("disabled");
                resolve(result);

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
 * Enable endpoint
 * @param {(string|ObjectID)} _id ObjectId
 * @param {function} cb Callback
 * @fires enable [hook]
 * @fires enabled [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function enable(_id, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("enable", _id, () => {

            // TODO

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
 * Refresh components maps/array
 * @param {function} [cb] Callback
 * @fires refresh [hook]
 * @fires refreshed [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function refresh(cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("refresh", {
            INTERFACE_COMMANDER,
            ENDPOINT_INTERFACES,
            list
        }, () => {

            // feedback
            log.debug("Refresh called");

            // cleanup
            INTERFACE_COMMANDER.clear();
            ENDPOINT_INTERFACES.clear();
            list.splice(0, list.length);

            // feedback
            log.verbose("fetch list from database");

            // fetch from database
            model.find({}).lean().exec((err, docs) => {

                if (err) {
                    log.error(err, "Could not fetch list from database");
                    reject(err);
                }


                // feedback
                log.debug("%d list fetched from database", docs.length);

                //@ts-ignore
                list.push(...docs);


                docs.forEach((endpoint: IEndpoint) => {

                    let interfaces: Array<String> = [];

                    endpoint.commands.forEach((command: ICommand) => {

                        if (!interfaces.includes(String(command.interface))) {
                            interfaces.push(String(command.interface));
                        }

                        ENDPOINT_INTERFACES.set(String(endpoint._id), interfaces);

                    });



                    interfaces.forEach((id) => {

                        //console.log("iface:", id, endpoint.commands);


                        let ifaceCmds = endpoint.commands.filter((cmd: ICommand) => {
                            return String(cmd.interface) === String(id);
                        });

                        //console.log(typeof id)

                        //FIXME ts error, ADAPTER_INSTANCES.get not recognized
                        //@ts-ignore
                        if (ADAPTER_INSTANCES.has(String(id))) {

                            //@ts-ignore
                            let adapter = ADAPTER_INSTANCES.get(String(id));
                            let commander = new Commander(ifaceCmds, adapter, id);
                            INTERFACE_COMMANDER.set(String(id), commander);

                            // listen for device commands from commander instance
                            // re-emit them over components events EventEmitter
                            commander.on("command", (...args: any[]) => {
                                log.verbose("<CMD:received>", args, endpoint);
                                events.emit.apply(events, ["command.received", ...args, endpoint]);
                            });


                        } else {

                            // FIXME
                            // in 99,9% device is not enabled, should we query the db ?
                            // or in the interface/device component take a lookup ?
                            // if device is disable, disable all list too!! (?)


                            //console.log(ADAPTER_INSTANCES)
                            log.warn("Could not find adapter instance for interface id %s (%s), device enabled?!", id, endpoint.name);
                            log.error("Could not create create endpoint commander instance for interface %s", id);

                        }


                    });




                });


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
* Add Endpoint to database
* @param {object} data device object
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
                    log.error(err, "Could not add endpoint doc, %j: %s", data, err.message);

                    reject(err);
                    return;

                }

                // feedback
                log.info("Endpoint %s added to databse: %j", doc._id, doc);

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
 * Remove all list
 * @fires clean [hook]
 * @fires cleaned [event]
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed* 
 * @param {function} [cb]
 */
function clean(cb) {

    // wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("clean", () => {
            model.deleteMany({}, (err) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not remove endpoints", err.message);

                    reject(err);
                    return;

                }

                // feedback
                log.info("Removed all endpoints");

                // done
                resolve();
                events.emit("cleaned");

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
 * TODO
 * @param _id 
 * @param cb 
 */
function get(_id, cb) {


    // wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("get", () => {

            // TODO implement

            /*
                            if (err) {
            
                                // feedback
                                log.error(err, "Could remove list", err.message);
            
                                reject(err);
                                return;
            
                            }
            
                            // feedback
                            log.info("Removed all list");
            
                            // done
                            resolve();
                            events.emit("get");
            */

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

    list.clear();


    interfaceCommands.clear();
    commanderInstances.clear();



    model.find({}).lean().exec((err, docs) => {

        if (err) {
            log.error(err, "Could not fetch docs: %s", err.message);
            process.exit();
        }


        let enabled = docs.filter((doc) => {
            //@ts-ignore
            return doc.enabled;
        });


        enabled.forEach((doc) => {

            // create new endpoint instance
            let endpoint = new Endpoint(doc);
            list.set(String(doc._id), endpoint);

        });


        // feedback
        log.debug("%d/%d endpoints enabled", enabled.length, docs.length);

        COMPONENT.ready = true;
        events.emit("ready");

    });

}



setImmediate(() => {

    const dependencies = [
        C_ADAPTER,
        C_INTERFACES
    ].map((component) => {
        return new Promise((resolve) => {

            //@ts-ignore
            if (component.ready) {
                return resolve();
            }

            //@ts-ignore
            component.events.on("ready", () => {
                resolve();
            });

        })
    });


    // wait for dependencies befor we init
    Promise.all(dependencies).then(() => {
        factory();
    });

});