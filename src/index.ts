import * as uuid from "uuid/v4";
import * as fs from "fs";
const pkg = require(`${__dirname}/package.json`);

//require("./test");

const ENVIRONMENT = {
    // General settings
    //@ts-ignore
    DEBUG: null, //FIXME should be a string = ""
    LOG_LEVEL: "verbose",
    LOG_COMPONENT: "", // rename -> LOG_TARGET ?!
    UUID: uuid(),
    RSA_KEYGEN_BITS: 2048,
    NODE_ENV: "development", //FIXME set to production ?!
    BCRYPT_SALT_ROUNDS: 10,
    SECURE_START: "false",
    CLEAR_SCREEN: "true",
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
    HTTP_PORT: 3000,
    //HTTP_BACKLOG: 511,
    HTTP_NAME: "open-haus.lan",
    HTTP_SOCK_ENABLED: false,
    HTTP_SOCK_PATH: "/var/run/open-haus.sock",
    // SMTP Server settings
    SMTP_DEBUG: false,
    //@ts-ignore
    SMTP_HOST: "localhost",
    SMTP_PORT: 587,
    SMTP_SECURE: true,
    SMTP_AUTH_USER: "",
    SMTP_AUTH_PASS: "",
    SMTP_CLIENT_NAME: "OpenHaus"
};


// init message
console.log("Starting OpenHaus...");

// external config params
process.env = Object.assign(ENVIRONMENT, process.env);


if (process.env.NODE_ENV !== "production") {

    // NOTE should we keep dotenv as dependencie?
    // > move up to process.env = Object.assign(..., dot.parsed);
    // > adjust path if moved/integrated

    // read&parse .env file
    const dot = require("dotenv").config({
        path: `${__dirname}/../.env`,
        debug: process.env.DEBUG //FIXME debug = what ? boolean or string ?!
    });

    // override existing env vars
    Object.assign(process.env, dot.parsed);

    if (process.env.CLEAR_SCREEN === "true") {
        require("clear")();
    }

}


//import * as logger from "./logger";
import logger = require("./logger");

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


//@ts-ignore
//logger.debug("Startup script...");
//require("./components/startup");


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

        require("./components/webserver");
        require("./components/devices");
        require("./components/endpoints");
        require("./components/interfaces");
        require("./components/adapters");
        require("./components/commander");

    });


});