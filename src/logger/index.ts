import * as winston from "winston";
import * as path from "path";
import * as safe from "colors/safe";
import * as dateFormat from "dateformat";

// NOTE use https://www.npmjs.com/package/triple-beam?
// TODO: https://github.com/winstonjs/winston#working-with-multiple-loggers-in-winston
// https://github.com/winstonjs/winston/issues/1498
// https://github.com/winstonjs/winston/issues/1338

const LEVELS = {
    levels: {
        error: 0,
        warn: 1,
        notice: 2,
        info: 3,
        debug: 4,
        verbose: 5
    },
    colors: {
        error: "red",
        warn: "yellow",
        notice: "magenta",
        info: "blue",
        debug: "gray",
        verbose: "cyan"
    }
};


// create formate cli logger
const consoleFormat = (name: string) => {
    return winston.format.combine(
        winston.format.label({
            label: name
        }),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf((msg) => {

            /*
            if (msg instanceof Error) {
                msg = Object.assign({
                    message: msg.message,
                    stack: msg.stack
                }, msg);
            }
            */

            //@ts-ignore
            const color = safe[LEVELS.colors[msg.level]];

            const timestamp = dateFormat(msg.timestamp, "yyyy.mm.dd - HH:MM.ss.l");
            return `[${color(timestamp)}][${color(msg.label)}][${color(msg.level)}] ${msg.message}`;

        })
    )
};


const logger = winston.createLogger({
    levels: LEVELS.levels,
    exitOnError: false,
    level: String(process.env.LOG_LEVEL),
    transports: [
        new winston.transports.Console({
            format: consoleFormat("system")
        }),
        new winston.transports.File({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.json()
            ),
            filename: path.resolve(__dirname, "../log/OpenHaus.log")
        })
    ]
});



if (process.env.NODE_ENV !== "production") {

    // exit if we build shit...
    logger.exitOnError = true;
    let message = "Demo logging message :)";

    if (process.env.LOG_COMPONENT === "logger") {
        console.log();
        logger.verbose(message);
        logger.debug(message);
        logger.info(message);
        logger.notice(message);
        logger.warn(message);
        logger.error(message);
        console.log();
    }

}


//@ts-ignore
logger.create = (name: string) => {

    let options = {
        levels: LEVELS.levels,
        level: process.env.LOG_LEVEL,
        silent: true,
        transports: [
            new winston.transports.Console({
                format: consoleFormat(name)
            }),
            new winston.transports.File({
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.json()
                ),
                filename: path.resolve(__dirname, `../log/${name}.log`)
            })
        ]
    };


    if (process.env.LOG_COMPONENT) {
        if (process.env.LOG_COMPONENT === name) {
            options.silent = false;
        } else {
            options.silent = true;
        }
    } else {
        options.silent = false;
    }


    // create & return logger
    return winston.loggers.add(name, options);

}


module.exports = logger;