import * as uuid from "uuid/v4";
import path = require("path");


// defaults
const ENVIRONMENT = {
    // General settings
    //@ts-ignore
    DEBUG: null, //FIXME should be a string = "" -> use as log target in logger ?!
    UUID: uuid(),
    RSA_KEYGEN_BITS: 2048,
    NODE_ENV: "development", //FIXME set to production ?!
    BCRYPT_SALT_ROUNDS: 10,
    SECURE_START: "false",
    CLEAR_SCREEN: "true",
    MAX_EVENT_LISTENERS: "10",
    TELEMETRY_POLICY: "disabled", // full/disabled/enablde/true/false?!
    CRASH_REPORT: "enabled", // -> true/false?!
    EXIT_ON_CRASH: "true",
    IGNORE_COMPONENTS: "", // FOR TEST
    // Logger settings
    LOG_LEVEL: "verbose",
    LOG_COMPONENT: "", // rename -> LOG_TARGET ?!
    LOG_SILENT: "false", // -> log suppress ?!
    LOG_SUPPRESS: "false", // used for tests
    //TODO implement?
    LOG_TRANSPORT: "terminal,file,database",
    LOG_PATH: path.resolve(process.cwd(), "logs"),
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
    //HTTP_BACKLOG: 511, //TODO remove
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




// external config params
process.env = Object.assign(ENVIRONMENT, process.env);


// read&parse .env file
const dot = require("dotenv").config({
    path: `${process.cwd()}/.env`,
    debug: process.env.DEBUG
});


if (process.env.NODE_ENV !== "production") {
    Object.assign(process.env, dot.parsed);
}