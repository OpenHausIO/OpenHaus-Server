import * as Express from "express";
import * as Winston from "winston";
import { json } from "body-parser";
import { model } from "mongoose";

const restHandler = require("./rest-handler.js");

module.exports = (logger: Winston.Logger, app: any) => {

    //feedback
    logger.debug("[api-handler] Create RESTful API");


    // create api router
    const router = Express.Router();
    app.use("/api", router);


    // parase /api as json
    router.use(json());


    // lowercase http headers
    router.use((req, res, next) => {

        //@ts-ignore
        Object.keys(req.headers).reduce((c, k) => (c[k.toLowerCase()] = req.headers[k], c), {});

        next();

    });


    // create sub router for each model/schema
    const routerUsers = Express.Router();
    const routerDevices = Express.Router();
    const routerRooms = Express.Router();
    const routerEndpoints = Express.Router();
    const routerAdapters = Express.Router();
    const routerScenes = Express.Router();


    // create rest route for each model/schema
    restHandler(model("Users"), routerUsers);
    restHandler(model("Devices"), routerDevices);
    restHandler(model("Rooms"), routerRooms);
    restHandler(model("Endpoints"), routerEndpoints);
    restHandler(model("Adapters"), routerAdapters);
    restHandler(model("Scenes"), routerScenes);


    // mount 
    router.use("/users", routerUsers);
    router.use("/devices", routerDevices);
    router.use("/rooms", routerRooms);
    router.use("/endpoints", routerEndpoints);
    router.use("/adapters", routerAdapters);
    router.use("/scenes", routerScenes);


    // extend rest routes
    require("./api.endpoints.js")(routerEndpoints);
    require("./api.interfaces.js")(routerDevices);
    require("./api.scenes.js")(routerScenes);

};