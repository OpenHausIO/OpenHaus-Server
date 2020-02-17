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
    console.log("-- API ROUTES NOT REQUIRED!!!!!!!!!!!!")
    //require("../../routes/router.auth.js")(app);
    // require("../../routes/router.api.js")(app);
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


module.exports = {
    server,
    start,
    stop,
    __proto__: COMPONENT,
    prototype: COMPONENT
};


/**
 * Start the http server
 * @param {function} [cb]
 * @fires start [hook]
 * @fires started [event]
 * @returns {(Promsie|undefined)} Returns a promise if no callback is passed otherwise "undefined"
 */
function start(cb) {

    let prom = new Promise((resolve, reject) => {
        hooks.emit("start", () => {

            // feedback
            log.debug("Start http server...");

            server.once("listening", () => {
                log.verbose("HTTP server started");
                resolve();
                events.emit("started");
            });

            // listen
            server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

        });
    });

    if (!cb) {
        return prom;
    }

    // use callback
    prom.then(cb).catch(cb);

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
        hooks.emit("stop", () => {

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
    prom.then(cb).catch(cb);

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
            //module.exports.isReady = false; //NOTE needed?!
            server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

        });

    } else {

        log.verbose("Startup server");
        server.listen(Number(process.env.HTTP_PORT), String(process.env.HTTP_HOST));

    }
}

// init
factory();




/*

process.nextTick(() => {

    // create express app instace
    // use express as http handler
    const app = express();


    require("./database/index.js");
    require("./interfaces.js");
    require("./adapter.js");

    setTimeout(() => {
        require("./endpoint.js");
    }, 500);



    setTimeout(() => {
        //  log.warn("Require API routes");
        require("./routes/router.auth.js")(app);
        require("./routes/router.api.js")(app);
        //require("./routes/router.plugins.js")(app);
    }, 1000);



    setImmediate(() => {

        // HTTP Server
        // port based
        (() => {

            const server = app.listen(
                Number(process.env.HTTP_PORT),
                String(process.env.HTTP_HOST),
                Number(process.env.HTTP_BACKLOG), function () {

                    const addr = this.address();
                    log.info("Listen on http://%s:%d", addr.address, addr.port);

                });

            server.on("error", (err) => {

                //@ts-ignore
                log.error("Could not start HTTP server on %s:%d (%s)", process.env.HTTP_HOST, process.env.HTTP_PORT, err.code);
                //log.error(err, null);
                return process.exit(1);


            });

        })();


        // HTTP Server
        // socket based
        (() => {
            if (String(process.env.HTTP_SOCK_ENABLED) == "true") {

                // feedback
                log.debug("sock enabled, create/listen server");
                log.warn("START SOCKET SERVER WITHOUT AUTHENTICATION LISTENING!");

                // database stuff
                const mongoose = require("mongoose");
                const model = mongoose.model("Users");

                model.find({}, (err: Error, docs: Array<IUser>) => {

                    if (err) {
                        log.error(err, "Could not fetch databse: %s", err.message);
                        return;
                    }

                    if (docs.length > 0) {

                        // feedback
                        logger.verbose("Users in databse found, dont start http socket server");

                    } else {

                        log.debug("Create socket HTTP server");

                        //@ts-ignore
                        const server = http.createServer();


                        server.on("request", require("./routes/socket-server.js"));


                        server.on("error", (err: Error) => {

                            //@ts-ignore
                            log.error("Could not start HTTP socket server: %s", err.code);
                            //log.error(err, null);
                            return process.exit(1);


                        });


                        server.listen(
                            //@ts-ignore
                            String(process.env.HTTP_SOCK_PATH),
                            Number(process.env.HTTP_BACKLOG),
                            () => {

                                log.info("HTTP Socket server started on '%s'", process.env.HTTP_SOCK_PATH);

                                process.stdin.resume();

                                const exitHandler = (
                                    options: any,
                                    code: Number
                                ) => {

                                    if (options.cleanup) {
                                        try {

                                            // remove socket file from file system
                                            fs.unlinkSync(String(process.env.HTTP_SOCK_PATH));
                                            process.exit();

                                        } catch (e) {
                                            //@ts-ignore
                                            if (err.code === "ENOENT") {
                                                logger.debug("sock file not found!");
                                            } else {
                                                logger.error(e, "Could not remove socket file! %s", e.code);
                                            }
                                        }
                                    }

                                    if (code || code === 0) {
                                        console.log(code);

                                    }

                                    if (options.exit) {
                                        process.exit();
                                    }

                                };


                                process.on('exit', exitHandler.bind(null, { cleanup: true }));
                                process.on('SIGINT', exitHandler.bind(null, { exit: true }));
                                process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
                                process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
                                process.on("uncaughtException", exitHandler.bind(null, { exit: true }));


                            });

                    }

                });

            }
        })();

    });

});
*/