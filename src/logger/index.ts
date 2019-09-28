import * as winston from "winston";
import * as path from "path";
import * as safe from "colors/safe";
import * as dateFormat from "dateformat";

// NOTE use https://www.npmjs.com/package/triple-beam?
//TODO: https://github.com/winstonjs/winston#working-with-multiple-loggers-in-winston

const Levels = {
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

            //@ts-ignore
            const color = safe[Levels.colors[msg.level]];

            const timestamp = dateFormat(msg.timestamp, "yyyy.mm.dd - HH:MM.ss.l");
            return `[${color(timestamp)}][${color(msg.label)}][${color(msg.level)}] ${msg.message}`;

        })
    )
};



const logger = winston.createLogger({
    levels: Levels.levels,
    exitOnError: false,
    level: "verbose",
    transports: [
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

    // add logger to winston
    logger.add(
        new winston.transports.Console({
            format: consoleFormat("system")
        })
    );

    console.log();
    logger.verbose("Verbose");
    logger.debug("Debug");
    logger.info("Info");
    logger.notice("notice");
    logger.warn("warn");
    logger.error("error");
    console.log();


}

//@ts-ignore
logger.create = (name: string) => {

    return winston.loggers.add(name, {
        levels: Levels.levels,
        level: "verbose",
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
    });

}


module.exports = logger;