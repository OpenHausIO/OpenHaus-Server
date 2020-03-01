import { EventEmitter } from "events";
import * as mongoose from "mongoose";
import * as logger from "../../logger/index.js";
import Hooks = require("../../system/hooks");
import { IPlugin } from '../../database/model.plugins.js';



//@ts-ignore
const log = logger.create("plugins");
const events = new EventEmitter();


const model = mongoose.model("Plugins");
//@ts-ignore
const hooks = new Hooks();
const PLUGINS = new Map<String, Object>();

export interface COMPONENT {
    events: EventEmitter,
    hooks: Object,
    ready: Boolean,
    factory: Function
}

export interface ICPlugins extends COMPONENT {
    PLUGINS: Map<String, Object>,
    static: Boolean
};


//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};


module.exports = {
    PLUGINS,
    install,
    __proto__: COMPONENT,
    prototype: COMPONENT
};



/**
 * Installs a plugin
 * @param obj 
 * @param cb 
 * @todo
 */
function install(obj, cb) {
    return new Promise((resolve, reject) => {


        (new model(obj)).save((err, doc) => {

            if (err) {
                log.error(err, "Could create document in database", err.message);
                cb(err);
                reject(err);
                return;
            }

            if (!err && doc) {




            } else {

                // unknown
                // feedback
                log.warn("No error, no document... could this be happen?!");
                reject(new Error());
                cb(new Error());

            }

        });


    });
}




/**
 * Component factory
 */
function factory() {

    /*

    (install({
        name: "test",
        alias: "test-folder",
        tarball: fs.readFileSync(path.join(process.cwd(), "test-plugin.tgz"))
    }, (err, result) => {

        console.log(err, result)

    })).then((doc) => {
        console.log("installed", doc);
    }).catch((err) => {
        console.log("aborted");
    });

*/


    // feedback
    log.debug("Factory called");

    // clear map
    PLUGINS.clear();

    // query database
    model.find({}).lean().exec((err, list) => {

        if (err) {
            log.error(err, "Could not fetch plugins from database!");
            return;
        }


        // filter enabled plugins
        let listEnableds = list.filter((e: IPlugin) => e.enabled);
        log.debug("%d plugins fetched from database, %d are enabled", list.length, listEnableds.length);


        // emit middleware hook
        hooks.emit("fetched", list, () => {

            // feedback
            log.verbose("[hooks] fetched middleware final reached");
            log.verbose("Load enabled plugins (%d)", listEnableds.length);


            // load enabled plugins
            listEnableds.forEach((item: IPlugin) => {

                // feedback
                log.verbose("Try to require '%s'", item.name);

                try {

                    // feedback
                    log.verbose("Create logger for '%s'", item.name);
                    //@ts-ignore
                    let pLogger = logger.create(`plugins/${item.alias}`);

                    try {

                        // require plugin
                        // TODO isolate plugin scope?!
                        // FIXME
                        require(`../../plugins/${item.alias}`)(pLogger);

                    } catch (e) {
                        if (e.code === "MODULE_NOT_FOUND") {

                            // feedback
                            log.warn("Plugin '%s' not found", item.name);

                            // throw further
                            throw e;

                        } else {

                            // feedback
                            pLogger.warn("Unexpected error thrown/occured");
                            pLogger.error(e, "Error in plugin %s", item.name);

                        }
                    }

                    //NOTE called when require crash ?!
                    PLUGINS.set(String(item._id), item);

                } catch (e) {

                    // feedback
                    log.error(e, "Could not load plugin '%s', Error: %s", item.name, e.message);

                }

            });


            // all plugins loaded
            // component ready!
            COMPONENT.ready = true;

            process.nextTick(() => {
                events.emit("ready");
            });

        });


    });

}

if (process.env.SECURE_START !== "true") {

    // feedback
    log.verbose("Call factory function on component");

    // init
    factory();

} else {

    // feedback
    log.warn("Secure start enabled, ignore component!");

}