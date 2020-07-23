import express = require("express");
import C_DEVICES = require("../components/devices");
import C_INTERCACES = require("../components/interfaces");



//@ts-ignore
module.exports = (log) => {

    // create device router
    const router = express.Router();

    router.param("_id", (req, res, next, _id) => {

        //@ts-ignore
        if (C_DEVICES.list.has(_id)) {
            //@ts-ignore
            req.device = C_DEVICES.get(_id);
            return next();
        }

        //@ts-ignore
        C_DEVICES.fetch(_id).then((data) => {

            if (!data) {

                res.status(404);

                res.json({
                    error: "Device not found",
                    code: "DEVICE_NOT_FOUND"
                });

                return;

            }

            //@ts-ignore
            req.device = data;

        });

    });


    router.param("_iface", (req, res, next, _id) => {

        //@ts-ignore
        if (C_INTERCACES.list.has(_id)) {
            //@ts-ignore
            req.iface = C_INTERCACES.get(_id);
            return next();
        }

        //@ts-ignore
        C_INTERCACES.fetch(_id).then((data) => {

            if (!data) {

                res.status(404);

                res.json({
                    error: "Interface not found",
                    code: "IFACE_NOT_FOUND"
                });

                return;

            }

            //@ts-ignore
            req.iface = data;

        });

    });



    router.get("/:_id/:_iface", (req, res) => {

        // check if websocket upgrade
        // if yes handle websocket
        // no -> return iface object

    });


    return router;

}