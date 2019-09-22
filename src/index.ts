if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
    require("clear")();
}

//const express = require("express");
import * as express from "express";


// init message
console.log("Starting OpenHaus...");


// create http handler
const app = express();


// required dependencies
require("./database/index.js");
const log = require("./logger/index.js");


// start http server
// require routes
app.listen(80, "0.0.0.0", function () {

    //const addr = this.address();
    //log.info("HTTP Server listen on http://%s:%d", addr.address, addr.port);
    console.log("HTTP Started...");



    setImmediate(() => {
        app.emit("listening");

        require("./routes/router.api.js")(log, app);
    });

});


app.on("listening", function () {

    //console.log(this.adderss)

    //const addr = this.adress();
    //log.silly("HTTP Server listening on %s:%d", addr.address, addr.port);
    log.info("HTTP Server listen...")


    // require http api handler


});


