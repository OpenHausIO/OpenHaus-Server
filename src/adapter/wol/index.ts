import { PassThrough, Transform } from "stream";
import winston = require('winston');


module.exports = (log: winston.Logger) => {

    // magic packet constants
    const MAC_REPEAT = 16;
    const MAC_LENGTH = 0x06;
    const PACKET_HEADER = 0x06;

    //@ts-ignore
    return (upstream) => {

        // feedback
        log.debug("Adapter instance for interface %s", String(upstream._id));


        // passthrough wrapper
        const transmit = new PassThrough();
        const receive = new PassThrough();


        // encode data
        const encode = new Transform({
            transform: (mac, encoding, cb) => {

                let parts = mac.match(/[0-9a-fA-F]{2}/g);

                if (!parts || parts.length !== MAC_LENGTH) {
                    cb(new Error(`malformed MAC address "${mac}"`));
                }

                let buffer = Buffer.alloc(PACKET_HEADER);
                let bufMac = Buffer.from(parts.map(p => parseInt(p, 16)));
                buffer.fill(0xff);

                for (var i = 0; i < MAC_REPEAT; i++) {
                    buffer = Buffer.concat([buffer, bufMac]);
                }

                // feedback
                log.verbose("[encode] called", encoding);

                cb(null, mac);

            }
        });


        // decode data
        const decode = new Transform({
            transform: (chunk, encoding, cb) => {

                //TODO implement decode
                // so we can detect when devices are
                // triggerd to wake (detects when device should power on)

                log.verbose("[decode] called", encoding);
                cb(null, chunk);

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