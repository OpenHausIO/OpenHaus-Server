import path = require("path");


// defaults
const ENVIRONMENT = {
    // General settings
    //@ts-ignore
    //RSA_KEYGEN_BITS: 2048,
    NODE_ENV: "development", //FIXME set to production ?!
    BCRYPT_SALT_ROUNDS: 10,
    //SECURE_START: "false",
    CLEAR_SCREEN: "true",
    //MAX_EVENT_LISTENERS: "10",
    //CRASH_REPORT: "enabled", // -> true/false?!
    //EXIT_ON_CRASH: "true",
    // Logging settings
    LOG_LEVEL: "verbose",
    LOG_TARGET: "",
    LOG_SUPPRESS: "false", // used for tests
    //TODO implement?
    //LOG_TRANSPORT: "terminal,file,database", //TODO implemnt!????
    LOG_PATH: path.resolve(process.cwd(), "logs"),
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
    HTTP_NAME: "open-haus.lan",
    //HTTP_SOCK_ENABLED: false,
    //HTTP_SOCK_PATH: "/var/run/open-haus.sock",
    // SMTP Server settings
    //SMTP_DEBUG: false,
    //@ts-ignore
    //SMTP_USE_EXTERNAL: "false",
    //SMTP_HOST: "127.0.0.1",
    //SMTP_PORT: 587,
    //SMTP_SECURE: true,
    //SMTP_AUTH_USER: "",
    //SMTP_AUTH_PASS: "",
    //SMTP_CLIENT_NAME: "OpenHaus"
};


// external config params
process.env = Object.assign(ENVIRONMENT, process.env);


// should we read & parse .env files ?!
if (process.env.NODE_ENV === "development") {

    const dot = require("dotenv").config({
        path: `${process.cwd()}/.env`,
        //debug: process.env.DEBUG // --> ignore ?!
    });

    Object.assign(process.env, dot.parsed);

}