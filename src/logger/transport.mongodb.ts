import Transport = require("winston-transport");
import mongoose = require("mongoose");

// logfiles
const model = mongoose.model("Logfiles");

// https://github.com/winstonjs/winston-transport



//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class MongoDB extends Transport {

    constructor(opts) {
        super(opts);
    }

    log(info, cb) {
        new model({
            //@ts-ignore
            label: info.label,
            level: info.level,
            message: info.message,
            timestamp: info.timestamp,
        }).save((err, doc) => {

            if (err) {
                return cb(err)
            }

            this.emit("logged", info);
            cb(null, doc);

        });
    }

};