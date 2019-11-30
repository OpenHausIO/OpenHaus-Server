import * as express from "express";
import * as fs from "fs";
import { execSync } from 'child_process';
import * as uuid from "uuid/v4";
const pkg = require("../package.json");

console.log(pkg);


//TODO add uuid to package.json
// copy package.json to dist folder

const DEFAULTS = {
    // General settings
    DEBUG: "",
    LOG_LEVEL: "info",
    UUID: uuid(),
    RSA_KEYGEN_BITS: 2048,
    NODE_ENV: "development",
    // Database settings
    DB_NAME: "OpenHaus",
    DB_HOST: "127.0.0.1",
    DB_PORT: 27017,
    DB_AUTH_USER: "",
    DB_AUTH_PASS: "",
    DB_AUTH_SOURCE: "admin",
    DB_CONN_TIMEOUT: 5000,
    BCRYPT_SALT_ROUNDS: 10,
    // HTTP Server settings
    HTTP_HOST: "0.0.0.0",
    HTTP_PORT: 80,
    HTTP_BACKLOG: 511,
    HTTP_NAME: "open-haus.lan",
    // SMTP Server settings
    SMTP_DEBUG: false,
    SMTP_HOST: "127.0.0.1",
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

    //console.log("NODE_ENV = %s", process.env.NODE_ENV);
    console.log(process.env.HTTP_NAME)

    // NOTE should we keep dotenv as dependencie?
    // > move up to process.env = Object.assign(..., dot.parsed);
    // > adjust path if moved/integrated

    // read&parse .env file
    const dot = require("dotenv").config({
        path: `${__dirname}/../.env`,
        debug: process.env.DEBUG
    });

    // override existing env vars
    Object.assign(process.env, dot.parsed);


    Object.keys(DEFAULTS).forEach((k) => {
        //console.log("%s = %s", k, process.env[k]);
    });


    if (process.env.CLEAR_SCREEN == "true") {
        require("clear")();
    }

}




const logger = require("./logger/index.js");
const log = logger.create("webserver");


if (!pkg.uuid) {
    try {

        logger.debug("Use generate UUID from startup");
        logger.verbose("Save UUID to package.json");
        logger.warn("fs.writeFileSync DISABLED!!!!");

        pkg.uuid = process.env.UUID;
        //fs.writeFileSync("./package.json", JSON.stringify(pkg));

    } catch (e) {

        logger.error(e, "Could not save UUID in/to package.json");
        process.exit(1);

    }
} else {

    logger.debug("Use UUID from packge.json");
    process.env.UUID = pkg.uuid;

}


// check if we have a keypair for signing our tokens
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



// create express app instace
// use express as http hanlder
const app = express();


process.nextTick(() => {

    require("./database/index.js");
    require("./routes/router.auth.js")(app);
    require("./routes/router.api.js")(app);
    //require("./routes/router.plugins.js")(app);

});


setImmediate(() => {

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

});