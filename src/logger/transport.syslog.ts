import Transport = require("winston-transport");
//import syslog = require("syslog-client");

// https://github.com/winstonjs/winston-transport
// https://www.npmjs.com/package/syslog-client

/*
const SEVERITY = {
    error: 3, // Error
    warn: 4, // Warning
    notice: 5, // Notice
    info: 6, // Informational
    debug: 7, // Debug
    verbose: 7 // Debug
};
*/

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class Syslog extends Transport {

    constructor(options) {

        // super constructor
        super(options);

        //@ts-ignore
        this.options = Object.assign({
            syslogHostname: "OpenHaus",
            //transport: syslog.Transport.Udp,
            port: 514
        }, options);

        //@ts-ignore
        //this.client = syslog.createClient("127.0.0.1", options);

        /*
                syslog.Severity
            Emergency - 0
            Alert - 1
            Critical - 2
            Error - 3
            Warning - 4
            Notice - 5
            Informational - 6
            Debug - 7
        */
    }

    log(info, cb) {

        /*
                    label: info.label,
                    level: info.level,
                    message: info.message,
                    timestamp: info.timestamp,
        */


        //@ts-ignore
        /*
        this.client.log(info.message, {
            facility: SEVERITY[info.level],
            timestamp: info.timestamp
        }, (err) => {

            if (err) {
                return cb(err);
            }

            this.emit("logged", info);
            cb(null);

        });
*/

    }

};