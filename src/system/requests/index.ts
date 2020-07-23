const url = require("url");
import system = require("../../");
//@ts-ignore
const log = system.logger.create("system/requests");


function redirect(res) {

}

//TODO require system logger
//TODO add redirect handler
//TODO add caller stack 

function request(uri, options, cb) {

    if (typeof (options) === "function") {
        cb = options;
        options = {};
    }

    // merge default & user options
    options = Object.assign({
        method: "GET",
        data: ""
    }, options);


    //feedback
    log.debug("[%s] %s", options.method, uri);

    // promsie wrapper
    let prom = new Promise((resolve, reject) => {

        let parts = new url.URL(uri);
        let protocol = parts.protocol.slice(0, -1);

        // set options parsed from uri
        // NOTE needed ?!
        options.protocol = parts.protocol;
        options.username = parts.username;
        options.password = parts.password;


        if (["http", "https"].indexOf(protocol) === -1) {
            reject(new Error("INVALID_PROTOCOL"));
            return;
        }

        // require http/https lib
        let req = require(protocol).request(uri, options, (res) => {

            //TODO immplement redirect
            const chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });


            res.once("end", () => {

                // concat body chunks
                let body = Buffer.concat(chunks);

                resolve({
                    request: {
                        data: options.data,
                        headers: options.headers || {}
                    },
                    response: {
                        status: res.statusCode,
                        headers: res.headers,
                    },
                    body: body.toString()
                });

            });


        });

        req.on("error", (err) => {
            reject(err);
        });

        req.end(options.data);

    });



    if (!cb) {
        return prom;
    }

    prom.then((data) => {
        cb(null, data);
    }).catch(cb);

}


module.exports = {
    redirect,
    request
};