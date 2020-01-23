import { PassThrough, Transform } from "stream";


//@ts-ignore
module.exports = (log) => {

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
            transform: (chunk, encoding, cb) => {

                log.verbose("[encode] called", encoding);
                cb(null, chunk);

            }
        });


        // decode data
        const decode = new Transform({
            transform: (chunk, encoding, cb) => {

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