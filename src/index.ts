import * as express from "express";
import * as fs from "fs";
import { execSync } from 'child_process';
import * as uuid from "uuid/v4";


// external config params
process.env = Object.assign({
    DB_NAME: "OpenHaus",
    DB_HOST: "127.0.0.1",
    DB_PORT: 27017,
    DB_AUTH_USER: "",
    DB_AUTH_PASS: "",
    BCRYPT_SALT_ROUNDS: 10,
    HTTP_HOST: "0.0.0.0",
    HTTP_PORT: 80,
    HTTP_BACKLOG: 511,
    LOG_LEVEL: "info",
    UUID: uuid(),
    RSA_KEYGEN_BITS: 2048
}, process.env);


if (process.env.NODE_ENV !== "production") {

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

    if (process.env.CLEAR_SCREEN == "true") {
        require("clear")();
    }

}


// init message
console.log("Starting OpenHaus...");


const logger = require("./logger/index.js");
const log = logger.create("webserver");


// create http handler
const app = express();


// check if we have a keypair for signing our tokens
fs.access(`${__dirname}/private-key.pem`, fs.constants.F_OK, (err) => {
    if (err) {
        if (err.code === "ENOENT") {
            try {

                logger.info("Create public/private key-pair...");

                execSync(`openssl genpkey -algorithm RSA -out ./private-key.pem -pkeyopt rsa_keygen_bits:${process.env.RSA_KEYGEN_BITS}`, {
                    cwd: __dirname,
                    stdio: ["ignore", "inherit", "inherit"]
                });

                execSync("openssl rsa -pubout -in ./private-key.pem -out ./public-key.pem", {
                    cwd: __dirname,
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