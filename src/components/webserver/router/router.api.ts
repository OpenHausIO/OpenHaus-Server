import express = require("express");

module.exports = (app, log) => {

    // feedback
    log.verbose("Mount to parent app");

    // create api router
    const router = express.Router();

    // mount api router on parent app
    app.use("/api", router);


    router.use("/devices", require("../../routes/router.devices")(log));


    // api route
    router.all("*", (req, res) => {
        res.status(418).end("I'm a teaport");
    });


};