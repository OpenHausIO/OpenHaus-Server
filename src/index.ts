import * as express from "express";
import * as fs from "fs";
import { execSync } from 'child_process';
import * as uuid from "uuid/v4";
import * as http from "http";
import { IUser } from './database/model.users';
const pkg = require(`${__dirname}/package.json`);


const DEFAULTS = {
    // General settings
    //@ts-ignore
    DEBUG: null, //FIXME should be a string = ""
    LOG_LEVEL: "info",
    UUID: uuid(),
    RSA_KEYGEN_BITS: 2048,
    NODE_ENV: "development",
    BCRYPT_SALT_ROUNDS: 10,
    // API settings
    API_PROTECTED: false,
    // Database settings
    DB_NAME: "OpenHaus",
    DB_HOST: "127.0.0.1",
    DB_PORT: 27017,
    DB_AUTH_ENABLED: false,
    DB_AUTH_USER: "",
    DB_AUTH_PASS: "",
    DB_AUTH_SOURCE: "admin",
    DB_CONN_TIMEOUT: 5000, //FIXME not working
    // HTTP Server settings
    HTTP_HOST: "0.0.0.0",
    HTTP_PORT: 80,
    HTTP_BACKLOG: 511,
    HTTP_NAME: "open-haus.lan",
    HTTP_SOCK_ENABLED: false,
    HTTP_SOCK_PATH: "/var/run/open-haus.sock",
    // SMTP Server settings
    SMTP_DEBUG: false,
    //@ts-ignore
    SMTP_HOST: null,
    SMTP_PORT: 587,
    SMTP_SECURE: true,
    SMTP_AUTH_USER: "",
    SMTP_AUTH_PASS: "",
    SMTP_CLIENT_NAME: "OpenHaus"
};


// init message
console.log("Starting OpenHaus...");


// external config params
process.env = Object.assign(DEFAULTS, process.env);


if (process.env.NODE_ENV !== "production") {

    // NOTE should we keep dotenv as dependencie?
    // > move up to process.env = Object.assign(..., dot.parsed);
    // > adjust path if moved/integrated

    // read&parse .env file
    const dot = require("dotenv").config({
        path: `${__dirname}/../.env`,
        debug: process.env //FIXME debug = what ? boolean or string ?!
    });

    // override existing env vars
    Object.assign(process.env, dot.parsed);

    if (process.env.CLEAR_SCREEN == "true") {
        require("clear")();
    }

}




const logger = require("./logger/index.js");
const log = logger.create("webserver");


if (process.env.NODE_ENV === "development" && process.env.DEBUG === "OpenHaus") {
    Object.keys(DEFAULTS).forEach((k) => {
        logger.verbose("[ENV] %s = %s", k, process.env[k]);
    });
}


if (!pkg.uuid) {
    try {

        logger.debug("Use generated UUID from startup");
        logger.verbose("Save UUID to package.json");

        pkg.uuid = process.env.UUID;
        fs.writeFileSync(`${__dirname}/package.json`, JSON.stringify(pkg, null, 4));

    } catch (e) {

        logger.error(e, "Could not save UUID in/to package.json");
        process.exit(1);

    }
} else {

    logger.debug("Use UUID from package.json");
    process.env.UUID = pkg.uuid;

}

//TODO should we only check when the api is protected ?
//NOTE API is always protected ?! -> process.env.API_PROTECTED
// check if we have a keypair for signing JWT tokens
fs.access(`${__dirname}/private-key.pem`, fs.constants.F_OK, (err) => {
    if (err) {
        if (err.code === "ENOENT") {
            try {

                logger.info("Create public/private key-pair...");

                execSync(`openssl genpkey -algorithm RSA -out ./private-key.pem -pkeyopt rsa_keygen_bits:${process.env.RSA_KEYGEN_BITS}`, {
                    cwd: __dirname,
                    //FIXME not working in docker container
                    stdio: ["ignore", "ignore", "inherit"]
                });

                execSync("openssl rsa -pubout -in ./private-key.pem -out ./public-key.pem", {
                    cwd: __dirname,
                    //FIXME not working in docker container
                    stdio: ["ignore", "ignore", "inherit"]
                });

                logger.info("Public/private key-pair generated");

            } catch (e) {

                logger.error(e, "Could not create public/private key-pair");
                process.exit(1);

            }
        } else {
            logger.error(err, "Could not access public/private key-pair");
        }
    } else {
        logger.verbose("Public/private key-pair found");
    }
});




process.nextTick(() => {

    // create express app instace
    // use express as http handler
    const app = express();


    require("./database/index.js");
    require("./interfaces.js");
    require("./adapter.js");
    require("./endpoint.js");

    require("./routes/router.auth.js")(app);
    require("./routes/router.api.js")(app);
    //require("./routes/router.plugins.js")(app);


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