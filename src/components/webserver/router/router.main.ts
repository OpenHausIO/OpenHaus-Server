import express = require("express");

module.exports = (app, log) => {

    // feedback
    log.verbose("Mount to parent app");

    // create api router
    const router = express.Router();

    // mount api router on parent app
    app.use("/", router);


    // api route
    router.get("/", (req, res) => {
        log.debug("Request");
        res.end("Main router");
    });


};