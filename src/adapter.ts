import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import { IAdapter } from "./database/model.adapter";
import * as interfaces from "./interfaces";
import { IInterface } from './database/model.devices.js';


const model = mongoose.model("Adapters");
//const interfaces = require("./interfaces.js");
//@ts-ignore
const log = logger.create("adapter");
const adapterInstances = new Map();
const adapterFactorys = new Map();

model.find({}).lean().exec((err, adapters) => {

    if (err) {
        log.error(err);
        process.exit();
    }


    const adapter = adapters.map((adapter: IAdapter) => {
        return new Promise((resolve, reject) => {
            try {

                log.verbose("Try to require adapter '%s' (%s)", adapter.name, adapter.folder);

                // require adapter
                //@ts-ignore
                let adapterLogger = logger.create(`adapter/${adapter.folder}`);
                const factory = require(`./adapter/${adapter.folder}`)(adapterLogger);

                // store adapter factory
                adapterFactorys.set(String(adapter._id), factory);

                resolve();

            } catch (e) {
                if (e.code === "MODULE_NOT_FOUND") {

                    log.error("Adapter/folder '%s' not found!", adapter.folder);
                    resolve();

                } else {

                    log.warn("Error in Adapter %s (%s)", adapter.name, adapter.folder);
                    reject(e);

                }
            }
        });
    });


    Promise.all(adapter).then(() => {

        // feedback
        log.info("All %d adapters loaded", adapters.length);

        process.nextTick(() => {
            //@ts-ignore
            interfaces.forEach((iface: IInterface) => {

                // factory id
                let id = String(iface.adapter);

                if (adapterFactorys.has(id)) {

                    // feedback
                    log.verbose("Create adapter (%s) instance for interface '%s'", id, iface._id);
                    let factory = adapterFactorys.get(id);

                    try {

                        // create adapter instance for interface
                        let instance = factory(iface);
                        adapterInstances.set(iface._id, instance);



                    } catch (e) {

                        // feedback
                        log.warn("Could not create adapter instance (%s)", e.message);

                    }

                } else {

                    // feedback
                    log.warn("No adapter for interface '%s' found", id);

                }


            });
        });



    }).catch((e) => {

        // feedback
        log.error(e, "Could not load one or more adapter (%s)", e.code);


    });

});

export { adapterInstances };

module.exports = adapterInstances;