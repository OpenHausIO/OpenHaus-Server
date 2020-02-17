import { EventEmitter } from "events";
import * as mongoose from "mongoose";
import * as logger from "../../logger/index.js";
import { IEndpoint, ICommand } from '../../database/model.endpoints.js';
import Hooks = require("../../system/hooks");


//@ts-ignore
const log = logger.create("endpoints");
const events = new EventEmitter();


const CADAPTER = require("../adapters");
const ADAPTER_INSTANCES = CADAPTER.ADAPTER_INSTANCES;
const CCOMMANDER = require("../commander");
const Commander = CCOMMANDER.Commander;


export interface CEndpoints extends EventEmitter {
    isReady: Boolean
};





const model = mongoose.model("Endpoints");
//@ts-ignore
const hooks = new Hooks();


const ENDPOINTS: Array<IEndpoint> = [];

// key = interface id
// value = commander instance
const INTERFACE_COMMANDER = new Map<String, Object>();

// key = endpoint id
// values = array of interfaces
const ENDPOINT_INTERFACES = new Map<String, Array<String>>();



//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};


Object.assign(COMPONENT, {
    refresh
});


module.exports = {
    ENDPOINT_INTERFACES,
    INTERFACE_COMMANDER,
    ENDPOINTS,
    remove,
    update,
    disable,
    enable,
    fetch,
    add,
    command,
    __proto__: COMPONENT,
    prototype: COMPONENT
};



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
        hooks.emit("remove", _id, () => {

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
    prom.then(cb).catch(cb);

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
        hooks.emit("update", _id, data, () => {

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
    prom.then(cb).catch(cb);

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
        hooks.emit("disable", _id, () => {

            // TODO

        });
    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(cb).catch(cb);


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
        hooks.emit("enable", _id, () => {

            // TODO

        });
    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(cb).catch(cb);


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
        hooks.emit("refresh", {
            INTERFACE_COMMANDER,
            ENDPOINT_INTERFACES,
            ENDPOINTS
        }, () => {

            // feedback
            log.debug("Refresh called");

            // cleanup
            INTERFACE_COMMANDER.clear();
            ENDPOINT_INTERFACES.clear();
            ENDPOINTS.splice(0, ENDPOINTS.length);

            // feedback
            log.verbose("fetch endpoints from database");

            // fetch from database
            model.find({}).lean().exec((err, docs) => {

                if (err) {
                    log.error(err, "Could not fetch endpoints from database");
                    reject(err);
                }


                // feedback
                log.debug("%d endpoints fetched from database", docs.length);

                ENDPOINTS.push(...docs);


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
                            // if device is disable, disable all endpoints too!! (?)


                            //console.log(ADAPTER_INSTANCES)
                            log.warn("Could not find adapter instance for interface id %s (%s), device enabled?!", id, endpoint.name);
                            log.error("Could not create create endpoint commander instance for interface %s", id);

                        }


                    });




                });


                events.emit("refreshed");
                resolve(docs);

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
        hooks.emit("fetch", filter, lean, () => {

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
    prom.then(cb).catch(cb);

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
        hooks.emit("add", data, () => {

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
    prom.then(cb).catch(cb);

}


/**
 * Send command to endpoint/device interface
 * @param _id 
 * @param cmd_obj 
 * @param params 
 */
function command(cmd_obj, params, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.emit("command.transmit", cmd_obj, params, () => {

            // get commander instance
            let commander = INTERFACE_COMMANDER.get(String(cmd_obj.interface));

            if (!commander) {

                // feedback
                log.warn("No comander instance for endpoint interface '%s'", cmd_obj.interface);

                reject(new Error("NO_COMMANDER_INSTANCE"));
                return;
            }

            try {

                //@ts-ignore
                commander.submit(cmd_obj, params);
                resolve({
                    cmd_obj,
                    params
                });

            } catch (e) {

                // feedback
                log.error(e, "Could not submit command: %s", e.message);
                reject(e);

            }

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

    // feedback
    log.debug("Factory called");
    log.verbose("Clear component maps (interface_commander, endpoint_interfaces)");

    // cleanup
    INTERFACE_COMMANDER.clear();
    ENDPOINT_INTERFACES.clear();
    ENDPOINTS.splice(0, ENDPOINTS.length);

    // feedback
    log.verbose("fetch endpoints from database");

    // fetch from database
    model.find({}).lean().exec((err, docs) => {

        if (err) {
            log.error(err, "Could not fetch endpoints from database");
            process.exit();
        }


        // feedback
        log.debug("%d endpoints fetched from database", docs.length);

        ENDPOINTS.push(...docs);


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
                    // if device is disable, disable all endpoints too!! (?)


                    //console.log(ADAPTER_INSTANCES)
                    log.warn("Could not find adapter instance for interface id %s (%s), device enabled?!", id, endpoint.name);
                    log.error("Could not create create endpoint commander instance for interface %s", id);

                }


            });




        });

        log.info("Component initialized");

        COMPONENT.ready = true
        events.emit("ready");

    });

}


if (!CADAPTER.ready) {
    CADAPTER.events.on("ready", () => {
        factory();
    });
} else {
    factory();
}