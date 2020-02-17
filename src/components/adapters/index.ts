import { EventEmitter } from "events";
import * as logger from "../../logger/index.js";
import * as mongoose from "mongoose";
//@ts-ignore
import * as InterfaceStream from "interface-stream";
import { IAdapter } from '../../database/model.adapter.js';
import Hooks = require("../../system/hooks");

const CINTERFACES = require("../interfaces");


//@ts-ignore
const log = logger.create("adapters");
const events = new EventEmitter();
const model = mongoose.model("Adapters");
//@ts-ignore
const hooks = new Hooks();

const ADAPTER_INSTANCES = new Map<String, Object>();
const ADAPTER_FACTORYS = new Map<String, Function>();


//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};


module.exports = {
    ADAPTER_INSTANCES,
    ADAPTER_FACTORYS,
    __proto__: COMPONENT,
    prototype: COMPONENT
};




function factory() {

    // cleanup
    ADAPTER_FACTORYS.clear();
    ADAPTER_INSTANCES.clear();

    model.find({
        enabled: true
    }).lean().exec((err, adapters) => {

        if (err) {
            log.error(err);
            process.exit();
        }

        // feedback
        log.debug("%d enabled adapter(s) fetched from database", adapters.length)

        let adapter = adapters.map((adapter: IAdapter) => {
            return new Promise((resolve, reject) => {
                try {

                    // feedback
                    log.verbose("Try to require adapter '%s' (%s)", adapter.name, adapter.folder);

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

            //@ts-ignore
            CINTERFACES.INTERFACES.forEach((iface) => {

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
            module.exports.isReady = true
            events.emit("ready");


        }).catch((e) => {

            // feedback
            log.error(e, "Could not load one or more adapter (%s)", e.code);


        });

    });

}




//NOTE check for secure start ?
// adapters should be allways certified!
if (process.env.SECURE_START !== "true") {
    if (!CINTERFACES.ready) {
        CINTERFACES.events.on("ready", () => {

            // feedback
            log.verbose("Dependencie 'interfaces' component ready");
            log.verbose("Call factory function on component");

            // init
            factory();

        });
    } else {

        // init
        factory();

    }
} else {

    // feedback
    log.warn("Secure start enabled, ignore component!");

}