import { PassThrough, Transform } from "stream";
import winston = require('winston');


module.exports = (log: winston.Logger) => {

    // code here gets only executed once:
    // only when the adapter gets initialized!
    // 
    // if you need to communicate between interfaces in your adapter,
    // create here a event emitter!
    //
    // change plain to raw?!!?!?
    log.debug("Adapter singleton init called!");

    //@ts-ignore
    return (upstream) => {

        // feedback
        log.debug("Adapter instance for interface %s", String(upstream._id));


        // passthrough wrapper
        const transmit = new PassThrough();
        const receive = new PassThrough();


        // encode data
        const encode = new Transform({
            transform: (chunk, encoding, cb) => {

                log.verbose("[encode] called", encoding);
                cb(null, new Buffer(chunk).toString("base64"));

            }
        });


        // decode data
        const decode = new Transform({
            transform: (chunk, encoding, cb) => {

                log.verbose("[decode] called", encoding);
                cb(null, new Buffer(chunk).toString("utf8"));

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