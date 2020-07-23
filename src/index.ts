import * as fs from "fs";
const pkg = require(`${__dirname}/package.json`);
//import Hooks = require("./system/hooks");
//import mongoose = require("mongoose");
import uuid = require("uuid/v4");
//import { EventEmitter } from "events";
//@ts-ignore
//const hooks = new Hooks();
//const events = new EventEmitter();




// override process:
// - .kill?
// - .exit?

// change exit codes
// 1000 & above
// https://nodejs.org/dist/latest-v12.x/docs/api/process.html#process_exit_codes


// init message
console.log("Starting OpenHaus...");

// save pid file ?
// handle pid files?

// environment & settings 
require("./environment");
//require("./global-settings");


// clear terminal
if (process.env.CLEAR_SCREEN === "true" && process.env.NODE_ENV === "development") {
    require("clear")();
}


//import * as logger from "./logger";
import logger = require("./logger");


if (process.env.LOG_COMPONENT) {
    //@ts-ignore
    logger.warn("Log target set to: '%s'", process.env.LOG_COMPONENT);
}


if (!pkg.uuid) {
    try {

        if (!process.env.UUID) {
            // generate UUIDv4
            process.env.UUID = uuid();
            //@ts-ignore
            logger.debug("Use generated UUID from startup (%s)", process.env.UUID);
        }

        //@ts-ignore
        logger.verbose("Save UUID to package.json");

        pkg.uuid = process.env.UUID;
        fs.writeFileSync(`${__dirname}/package.json`, JSON.stringify(pkg, null, 4));

    } catch (e) {

        //@ts-ignore
        logger.error(e, "Could not save UUID in/to package.json");
        process.exit(1);

    }
} else {

    //@ts-ignore
    logger.debug("Use UUID from package.json");
    process.env.UUID = pkg.uuid;

}



process.nextTick(() => {

    // feedback
    //@ts-ignore
    logger.debug("Require database");
    require("./database");


    //@ts-ignore
    logger.debug("Require components");

    const COMPONENT_NAMES = [
        "webserver",
        "devices",
        "endpoints",
        "interfaces",
        "adapter",
        //"plugins",
        //"auth",
        //"users", -> TODO!!!
        //"scenes",
        //"smtp"
        //"ssdp"
        //"mqqt"
    ].sort(() => {

        // "randomize" startup
        return 0.5 - Math.random();

    });

    // counter var
    let counter = COMPONENT_NAMES.length;
    //@ts-ignore
    logger.debug("%d components to load...", COMPONENT_NAMES.length);

    COMPONENT_NAMES.forEach((name) => {
        //try {

        //@ts-ignore
        logger.debug("Load component: %s", name);

        // require component
        let component = require(`./components/${name}`);

        // list for ready events
        component.events.on("ready", () => {

            // feedback
            //@ts-ignore
            logger.verbose("component '%s' ready", name);

            // count down
            counter--;

            if (counter === 0) {

                // feedback
                //@ts-ignore
                logger.info("All %d components are ready to use!", COMPONENT_NAMES.length);
                //events.emit("load_plugins");

            }

        });
        /*
                } catch (err) {
        
                    //feedback
                    //@ts-ignore
                    logger.error(err, "Could not load component: %s, Error: %s", name, err.message);
                    process.exit(1000);
        
                }
                */
    })

});



/*
hooks.on("crash_report", (event, data, next) => {
    fs.writeFile(`${process.cwd()}/crash_report`, JSON.stringify({
        event,
        data
    }), (err) => {

        if (err) {
            //@ts-ignore
            logger.error(err, "Could not write crash report: %s", err.message);
        } else {
            //@ts-ignore
            logger.info("Crash reported created: %s", `${process.cwd()}/crash_report`);
        }

        //@ts-ignore
        logger.error("OpenHaus crashed: '%s': %j", event, data);


        if (process.env.EXIT_ON_CRASH === "true") {
            hooks.emit("cleanup", () => {

                //@ts-ignore
                logger.verbose("Cleanup hooks done");

                // close mongoose connection
                mongoose.connection.close(() => {
                    //@ts-ignore
                    logger.debug("Database connection closed");
                    //@ts-ignore
                    logger.info("Exit OpenHaus process...");
                    process.exit(1000);
                });

            });
        }

    });
});
*/


/*
module.exports = {
    //    events,
    hooks,
    logger
}
*/

/*
const vm = require('vm');

const x = 1;

const context = {
    process: Object.freeze(process),
    console: console,
    require: require,
    moduel: module
};
vm.createContext(context); // Contextify the object.


const code = 'console.log(require)';
// `x` and `y` are global variables in the context.
// Initially, x has the value 2 because that is the value of context.x.
vm.runInContext(code, context);
*/

/*

const p = new Proxy(process.env, {
    get: function (target, name) {
        console.log("acces %s in process.env", name);
        //@ts-ignore
        return target[name];
    },
    //@ts-ignore
    set: function (target, prop, value) {
        console.log("set %s in process.env to", prop, value);
        //console.log(target, prop, value);
        return true;
    }
});


console.log(p["UUID"]);

p.uuid = "aldsfkjadsf";

console.log(p["UUID"]);
*/