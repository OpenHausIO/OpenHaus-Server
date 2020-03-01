import Transport = require('winston-transport');
//import util = require('util');


// https://github.com/winstonjs/winston-transport



//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class MongoDB extends Transport {
    constructor(opts) {
        super(opts);

        //
        // Consume any custom options here. e.g.:
        // - Connection information for databases
        // - Authentication information for APIs (e.g. loggly, papertrail,
        //   logentries, etc.).
        //
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Perform the writing to the remote service

        callback();
    }
};