import { EventEmitter } from "events";
import * as http from "http";
import * as express from "express";
import * as logger from "../../logger";
import Hooks = require("../../system/hooks");

//@ts-ignore
const log = logger.create("webserver");
const events = new EventEmitter();

//@ts-ignore
const hooks = new Hooks();

// create express app instace
// use express as http handler
const app = express();
const server = http.createServer();

//@ts-ignore
server.started = false;

// use express as request handler
server.on("request", app);

// listen event handler
server.on("listening", () => {

    //@ts-ignore
    server.started = true;

    const addr = server.address();
    //@ts-ignore
    log.info("Listening on http://%s:%d (http://%s:%d)", addr.address, addr.port, process.env.HTTP_NAME, addr.port);


    log.info("Require API routes");
    console.log("-- API ROUTES NOT REQUIRED!!!!!!!!!!!!");

    //require("../../routes/router.auth.js")(app);
    //@ts-ignore
    require("./router/router.main")(app, logger.create("webserver/router/main"));
    //@ts-ignore
    //require("../../routes/router.api.js")(app, logger.create("webserver/router/api"));
    //require("../../routes/router.plugins.js")(app);


    log.info("Component ready");
    COMPONENT.ready = true;
    events.emit("ready");

});



//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events
};

const prototype = Object.create(COMPONENT);
module.exports = Object.assign(prototype, {
    server,
    start,
    stop
});


/**
 * Start the http server
 * @param {function} [cb]
 * @fires start [hook]
 * @fires started [event]
 * @returns {(Promsie|undefined)} Returns a promise if no callback is passed otherwise "undefined"
 */
function start(cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("start", () => {

            // feedback
            log.debug("Start http server...");

            server.once("listening", () => {
                log.verbose("HTTP server started");
                resolve();
                events.emit("started");
            });

            server.once("error", (err) => {
                reject(err);
            });

            // listen
            server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

        });
    });

    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(() => {
        cb(null);
    }).catch(cb);

}


/**
 * Stop the http server
 * @param {function} [cb]
 * @fires stop [hook]
 * @fires stopped [event]
 * @returns {(Promsie|undefined)} Returns a promise if no callback is passed otherwise "undefined"
 */
function stop(cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.trigger("stop", () => {

            // feedback
            log.debug("Stop http server...");

            server.close(() => {
                log.verbose("HTTP server stopped");
                resolve();
                events.emit("stopped");
            });

        });
    });

    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(() => {
        cb(null);
    }).catch(cb);

}


/**
 * Component factory
 */
function factory() {
    //@ts-ignore
    if (server.started) {

        // close server first
        server.close(() => {

            // feedback
            log.verbose("Restarted...");

            //@ts-ignore
            server.started = false; // -> server.running ?!
            server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

        });

    } else {

        log.verbose("Startup server");
        server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

    }
}

// init
factory();