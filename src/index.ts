if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
    require("clear")();
}

//const express = require("express");
import * as express from "express";

const logger = require("./logger/index.js");
const log = logger.create("webserver");

// init message
console.log("Starting OpenHaus...");


// create http handler
const app = express();


// required dependencies
require("./database/index.js");


require("./routes/router.api.js")(app);
//require("./routes/router.plugins.js")(app);


// start http server
// require routes
app.listen(80, "0.0.0.0", function () {

    const addr = this.address();
    log.info("Listen on http://%s:%d", addr.address, addr.port);

});