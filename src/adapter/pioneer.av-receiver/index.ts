import { PassThrough, Transform } from "stream";
import winston = require('winston');



module.exports = (log: winston.Logger) => {

    // code here gets only executed once:
    // only when the adapter gets initialized!
    // 
    // if you need to communicate between interfaces in your adapter,
    // create here a event emitter!
    log.debug("Adapter singleton init called!");

    //@ts-ignore
    return (upstream) => {

        // feedback
        log.debug("Adapter instance for interface %d", upstream._id);


        // passthrough wrapper
        const transmit = new PassThrough();
        const receive = new PassThrough();

        // encode data
        const encode = new Transform({
            transform: (data, encoding, cb) => {

                // feedback
                log.verbose("[encode] called", encoding);

                // Add ISCP header if not already present
                if (data.charAt(0) !== '!') {
                    data = `!1${data}`;
                }

                // ISCP message
                const iscp_msg = Buffer.from(`${data}\x0D\x0a`);

                // eISCP header
                const header = Buffer.from([
                    73, 83, 67, 80, // magic
                    0, 0, 0, 16,    // header size
                    0, 0, 0, 0,     // data size
                    1,              // version
                    0, 0, 0         // reserved
                ]);

                // write data size to eISCP header
                header.writeUInt32BE(iscp_msg.length, 8);
                cb(null, Buffer.concat([header, iscp_msg]));

            }
        });


        // decode data
        const decode = new Transform({
            transform: (data, encoding, cb) => {

                log.verbose("[decode] called", encoding);
                cb(null, data.toString('ascii', 18, data.length - 3));

            }
        });


        // pipe streams 
        transmit.pipe(encode).pipe(upstream);
        upstream.pipe(decode).pipe(receive);


        // return streams
        return {
            transmit,
            receive,
            encode,
            decode
        };

    };

};