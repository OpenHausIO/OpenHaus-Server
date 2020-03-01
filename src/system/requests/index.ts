import url = require("url");
import system = require("../../index");

//@ts-ignore
const log = system.logger; //.create("system/request");


function redirect() {

}

//TODO require system logger
//TODO add redirect handler
//TODO add caller stack 

function request(uri, options, cb) {

    if (typeof (options) === "function") {
        cb = options;
        options = {};
    }

    // default options
    options = Object.assign({
        data: "",
        method: "GET"
    }, options);



    //feedback
    log.verbose("[%s] %s", options.method, uri);


    let prom = new Promise((resolve, reject) => {

        let parts = new url.URL(uri);
        let protocol = parts.protocol.slice(0, -1);


        options.host = parts.host;
        options.port = parts.port;
        options.path = parts.pathname;
        options.protocol = parts.protocol;
        options.username = parts.username;
        options.password = parts.password;


        if (["http", "https"].indexOf(protocol) === -1) {
            reject(new Error("INVALID_PROTOCOL"));
            return;
        }

        //        console.log(options)

        // require http/https lib
        let lib = require(protocol);

        let req = lib.request(options, (res) => {

            //TODO immplement redirect

            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.once("end", () => {
                resolve({
                    info: {
                        status: res.statusCode,
                        headers: res.headers,
                        data: options.data
                    },
                    body
                })
            });

        });

        req.once("error", (err) => {
            reject(err);
        })

        //req.write(options.data);
        req.end(options.data);

    });


    if (!cb) {
        return prom;
    }

    prom.then(({ info, body }) => {
        cb(null, info, body);
    }).catch(cb);

}


module.exports = {
    redirect,
    request
};