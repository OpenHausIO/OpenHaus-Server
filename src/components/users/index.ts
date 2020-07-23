import { EventEmitter } from "events";
import * as logger from "../../logger";
import * as mongoose from 'mongoose';
import { IUser } from '../../database/model.users';
import Hooks = require("../../system/hooks");

const model = mongoose.model("Users");

//@ts-ignore
const log = logger.create("users");
const events = new EventEmitter();

//@ts-ignore
const hooks = new Hooks();



const list = new Map();

//@ts-ignore
const COMPONENT = {
    ready: false,
    hooks,
    events
};


const protoype = Object.create(COMPONENT);

/*
Object.assign(protoype, {
    list
});
*/

module.exports = Object.assign(protoype, {
    //list,
    add,
    get,
    fetch,
    update,
    remove,
    refresh,
    premissions
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
 * 
 * @param {object} data User object, mongodb schema: @link ....
 * @param {string} data.name Name to display/call the user
 * @param {string} data.email E-Mail address
 * @param {string} data.password Password to hash
 * @param {boolean} [data.enabled=true] Enable/disable user login
 * @param {function} [cb] callback
 * @returns {(Promise|undefined)} Returns a promise if no callback is passed
 */
function add(data, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("add", data, () => {
            new model(data).save((err, doc: IUser) => {

                if (err) {
                    log.error(err, "Could not add user: %s", err.message);
                    reject(err);
                    return;
                }

                // feedback
                log.info("User '%s' (%s) added successful", doc.name, doc.email);

                //NOTE remove password from object??!!!!
                //TODO remove password from object??!!!!

                events.emit("added", doc);
                resolve(doc);

            });
        });
    });

    if (!cb) {
        return prom;
    }

    prom.then((doc) => {
        cb(null, doc);
    }).catch(cb);

}


/**
* Remove user & active tokens/login sessions
* @param {string} _id user id
* @param {function} [cb] callback, if not passed, a promise is returned
* @fires remove [hook]
* @fires removed [event]
* @returns {(Promise|undefined)} Returns a promise if no callback is passed
*/
function remove(_id, cb) {

    // promise wrapper
    let prom = new Promise((resolve, reject) => {
        hooks.trigger("remove", _id, () => {

            model.find({
                _id
            }).exec((err, doc: IUser) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not delete/remove user '%s' : %s", _id, err.message);

                    reject(err);
                    return;

                }

                if (!doc) {

                    // feedback
                    log.warn("User '%s' not found", _id);

                    reject(new Error("USER_NOT_FOUND"));
                    return;

                }

                // feedback
                log.verbose("User '%s' (%s) remove/delted", doc.name, doc.email);

                // remove user endpoints
                mongoose.model("Tokens").deleteMany({
                    user: _id
                }, function (err) {

                    if (err) {

                        // feedback
                        log.error(err, "Could not remove user tokens for user: %s", doc.name, doc.email);

                        reject(err);
                        return;

                    }

                    events.emit("removed", _id);
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
 * Update user
 * @param {string} _id User ID
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
                    log.error(err, "Could not update user: %s", err.message);
                    reject(err);
                    return;
                }

                // update fetched doc
                doc.update(data, (err, result) => {

                    if (err) {
                        log.error(err, "Could not update user: %s", err.message);
                        reject(err);
                        return;
                    }

                    // feedback
                    log.debug("Updated user %s, %j", _id, data, result);
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
            }).lean().exec((err, docs) => {

                if (err) {

                    // feedback
                    log.error(err, "Could not fetch devices from database");

                    reject(err);
                    return;

                }

                docs.forEach((user) => {
                    list.set(user._id, user);
                });

                // feedback
                log.debug("User list refreshed!");
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
 * 
 * @param rights 
 * @param cb 
 */
function premissions(rights, cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("premissions", list, () => {

            // feedback
            log.warn("[premissions]: Implement");

            rights = {
                list: {
                    read: false,
                    create: false,
                    update: false,
                    remove: false,
                },
                rooms: {
                    read: false,
                    create: false,
                    update: false,
                    remove: false,
                },
                devices: {
                    read: false,
                    create: false,
                    update: false,
                    remove: false,
                },
                endpoints: {
                    read: false,
                    create: false,
                    update: false,
                    remove: false,
                }
            };

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

    model.find({}).lean().exec((err, docs) => {

        if (err) {
            log.error(err, "Could not fetch list form database");
            process.exit();
        }

        // feedback
        log.debug("%d list from database fetched", docs.length);


        docs.forEach((user: IUser) => {
            list.set(String(user._id), user);
        });

        COMPONENT.ready = true;
        events.emit("ready");

    });


});