import { EventEmitter } from "events";
import * as logger from "../../logger/index.js";
import * as mongoose from "mongoose";
import { IAdapter } from '../../database/model.adapter.js';
import Hooks = require("../../system/hooks");
import fs = require("fs");

const C_INTERFACES = require("../interfaces");


//@ts-ignore
const log = logger.create("adapters");
const events = new EventEmitter();
const model = mongoose.model("Adapters");
//@ts-ignore
const hooks = new Hooks();

const ADAPTER = new Map<String, Object>();
const ADAPTER_INSTANCES = new Map<String, Object>();
const ADAPTER_FACTORYS = new Map<String, Function>();


//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};


const prototype = Object.create(COMPONENT);
module.exports = Object.assign(prototype, {
    ADAPTER_INSTANCES,
    ADAPTER_FACTORYS,
    ADAPTER
});




function factory() {

    // cleanup
    ADAPTER.clear();
    ADAPTER_FACTORYS.clear();
    ADAPTER_INSTANCES.clear();


    fs.readdir(`${__dirname}/../../adapter`, (err, list) => {

        if (err) {
            // feedback
            log.error(err, "Could not read adapters directory: %s", err.message);
            return;
        }

        model.find({
            enabled: true
        }).lean().exec((err, docs) => {

            if (err) {
                log.error(err);
                process.exit();
            }

            if (docs) {
                docs.forEach((doc: IAdapter) => {
                    log.verbose("Store adapter '%s' in map", doc.folder);
                    ADAPTER.set(String(doc._id), doc);
                });
            }





            // feedback
            log.debug("%d enabled adapter(s) fetched from database", docs.length);
            log.verbose("compare adapters from database with adapters folder...");


            // compare adapter folde with database
            // add missing adapters to database
            // store adapters in map
            // push new added adapter to parent docs array
            let startup = list.map((folder) => {
                return new Promise((resolve, reject) => {

                    let found = docs.find((doc: IAdapter) => {
                        return folder === doc.folder;
                    });

                    if (!found) {

                        // feedback
                        log.verbose("Add adapter folder '%s' to database", folder);

                        new model({
                            folder
                        }).save((err, doc) => {

                            if (err) {
                                log.error(err, "Could not add adapter to database: %s", err.message);
                                reject();
                                return;
                            }

                            // feedback
                            log.info("Adapter '%s' added to database", folder);
                            log.verbose("Store new added added adapter ('%s') in map", folder);
                            ADAPTER.set(String(doc._id), doc);
                            docs.push(doc);
                            resolve();

                        });

                    } else {

                        // feedback
                        log.verbose("Adapter '%s' in database found", folder);
                        resolve();

                    }

                });
            });


            // require all adapters
            Promise.all(startup).then(() => {

                // feedback
                log.verbose("Require all %d adapters & call factory", docs.length);

                let adapter = docs.map((adapter: IAdapter) => {
                    return new Promise((resolve, reject) => {
                        try {

                            // feedback
                            log.verbose("Try to require adapter '%s'", adapter.folder);

                            // require adapter
                            //@ts-ignore
                            let adapterLogger = logger.create(`adapter/${adapter.folder}`);
                            let factory = require(`../../adapter/${adapter.folder}`)(adapterLogger);

                            // store adapter factory
                            ADAPTER_FACTORYS.set(String(adapter._id), factory);

                            resolve();

                        } catch (e) {
                            if (e.code === "MODULE_NOT_FOUND") {

                                log.error("Adapter/folder '%s' not found!", adapter.folder);
                                reject();

                            } else {

                                log.warn("Error in Adapter '%s'", adapter.folder);
                                reject(e);

                            }
                        }
                    });
                });

                Promise.all(adapter).then(() => {

                    // feedback
                    log.info("All %d adapters required", docs.length);

                    //@ts-ignore
                    C_INTERFACES.list.forEach((iface) => {

                        //console.log("Handle interface %s, adapter: %s", iface._id, iface.adapter, ADAPTER_FACTORYS);


                        // factory id
                        let id = String(iface.adapter);


                        if (ADAPTER_FACTORYS.has(id)) {

                            // feedback
                            log.verbose("Create adapter (%s) instance for interface '%s'", id, iface._id);
                            let factory = ADAPTER_FACTORYS.get(id);

                            try {

                                // create adapter instance for interface
                                let instance = factory(iface);
                                ADAPTER_INSTANCES.set(String(iface._id), instance);

                                log.info("Instance created for interface '%s'", iface._id);

                            } catch (e) {

                                // feedback
                                log.warn("Could not create adapter instance (%s)", e.message);

                            }

                        } else {

                            // feedback
                            //log.warn("No adapter for interface '%s' found", id);
                            // what do we here ?!
                            // just ignore ?!

                        }


                    });


                    log.info("Component initialized");
                    COMPONENT.ready = true
                    events.emit("ready");


                }).catch((e) => {

                    // feedback
                    log.error(e, "Could not load one or more adapter (%s)", e.code);

                });

            });

        });

    });

}



setImmediate(() => {



    const dependencies = [
        C_INTERFACES
        //C_DEVICES
    ].map((component) => {
        return new Promise((resolve) => {

            // feedback
            //log.verbose("Dependent from: %s", component.name); // set component name?

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

        // feedback
        log.info("Bootstryp factory");

        // init 
        factory();

    });

});