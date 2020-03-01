import * as fs from "fs";
const pkg = require(`${__dirname}/package.json`);
import Hooks = require("./system/hooks");
import mongoose = require("mongoose");
//import { EventEmitter } from "events";
//@ts-ignore
const hooks = new Hooks();
//const events = new EventEmitter();




// override process:
// - .kill?
// - .exit?

// change exit codes
// 1000 & above
// https://nodejs.org/dist/latest-v12.x/docs/api/process.html#process_exit_codes


// init message
console.log("Starting OpenHaus...");


// environment & settings 
require("./environment");
require("./global-settings");


// clear terminal
if (process.env.CLEAR_SCREEN === "true") {
    require("clear")();
}


//import * as logger from "./logger";
import logger = require("./logger");


if (process.env.LOG_COMPONENT) {
    //@ts-ignore
    logger.warn("Log target set to: '%s'", process.env.LOG_COMPONENT);
}

/*
//TODO info not really helpful
// err & origin empty
//@ts-ignore
process.on("uncaughtException", (err, origin) => {
    if (process.env.CRASH_REPORT === "enabled") {
        hooks.emit("crash_report", "uncaughtException", {
            err,
            origin
        }, (event, data, next) => {

            // call home
            // TODO implement call home: CRASH_REPORT

            next();

        });
    }
});

process.on("unhandledRejection", (reason, promise) => {
    if (process.env.CRASH_REPORT === "enabled") {
        hooks.emit("crash_report", "unhandledRejection", {
            reason,
            promise
        }, (event, data, next) => {

            // call home
            // TODO implement call home: CRASH_REPORT

            next();

        });
    }
});

*/



// secure start info
(() => {
    if (process.env.SECURE_START === "true") {
        //@ts-ignore
        logger.warn("!!! --- SECURE START IS ENABLED --- !!!");
        //@ts-ignore
        logger.warn("Perhaps some functions are limitated!");
        console.log();
    }
})();


if (!pkg.uuid) {
    try {

        //@ts-ignore
        logger.debug("Use generated UUID from startup");
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


/*
// TODO remove
process.nextTick(() => {

    // feedback
    //@ts-ignore
    logger.debug("Require database");
    require("./database");

    // load first all plugins
    // so we dont miss a event/hook call
    const C_PLUGINS = require("./components/plugins");

    // NOTE: Plugins haben keine einfluss auf component init
    // so warum erst plugins laden und nicht alle komponent gleich ?!
    // plugins intercepten hooks. hooks werden nur durch API/Daten fluss getriggert device<>server(connector)

    C_PLUGINS.events.on("ready", () => {

        //@ts-ignore
        logger.debug("Require components");

        const COMPONENT_NAMES = [
            "webserver",
            "devices",
            "endpoints",
            "interfaces",
            "adapters",
            "commander"
        ];

        // counter var
        let counter = COMPONENT_NAMES.length;


        COMPONENT_NAMES.forEach((name) => {
            try {

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
                    }

                });

            } catch (err) {

                //feedback
                //@ts-ignore
                logger.error(e, "Could not load component: %s", name);
                process.exit(1000);

            }
        })

    });

});
*/




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
        "adapters",
        "commander",
        "plugins",
        "auth",
        "users",
        "scenes",
        "smtp"
    ];

    // counter var
    let counter = COMPONENT_NAMES.length;
    //const IGNORE = process.env.IGNORE_COMPONENTS.split(",");
    //console.log(IGNORE)

    COMPONENT_NAMES.forEach((name) => {
        try {

            //@ts-ignore
            logger.debug("Load component: %s", name);

            // require component
            let component = require(`./components/${name}`);

            /*
            if (IGNORE.includes(name)) {
                //@ts-ignore
                logger.warn("Ignore component '%s'", name);
                counter--;
                return;
            }
            */

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

        } catch (err) {

            //feedback
            //@ts-ignore
            logger.error(err, "Could not load component: %s, Error: %s", name, err.message);
            process.exit(1000);

        }
    })

});




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

/*
events.on("load_plugins", () => {

    //@ts-ignore
    logger.debug("Require component: plugins");

    const C_PLUGINS = require("./components/plugins");

    C_PLUGINS.events.on("ready", () => {
        //@ts-ignore
        logger.info("%s plugin(s) loaded", C_PLUGINS.PLUGINS.size);
    });

});
*/


module.exports = {
    //    events,
    hooks,
    logger
}