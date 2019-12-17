import * as Express from "express";
import { json } from "body-parser";
import { model } from "mongoose";

const logger = require("../logger/index.js");
const handler = require("./rest-handler.js");
const restHandler = handler(logger.create("rest-handler"));

const auth = require("./router.auth.js");




module.exports = (app: Express.Router) => {


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


    // protect whole api router
    // user need specific rights
    if (process.env.API_PROTECTED == "true") {
        auth.protect(router);
    }


    // create sub router for each model/schema
    const routerUsers = Express.Router();
    const routerDevices = Express.Router();
    const routerRooms = Express.Router();
    const routerEndpoints = Express.Router();
    const routerAdapters = Express.Router();
    const routerScenes = Express.Router();


    /*
        routerUsers.use((req, res, next) => {
            console.log("pre User router called");
            next();
        });
    */


    // create rest route for each model/schema
    restHandler(model("Users"), routerUsers);
    restHandler(model("Devices"), routerDevices);
    restHandler(model("Rooms"), routerRooms);
    restHandler(model("Endpoints"), routerEndpoints);
    restHandler(model("Adapters"), routerAdapters);
    restHandler(model("Scenes"), routerScenes);


    // mount RESTful router
    router.use("/users", routerUsers);
    router.use("/devices", routerDevices);
    router.use("/rooms", routerRooms);
    router.use("/endpoints", routerEndpoints);
    router.use("/adapters", routerAdapters);
    router.use("/scenes", routerScenes);






    // extend rest routes
    require("./api.users.js")(logger.create("users"), routerUsers);     // <host>/api/users
    require("./api.endpoints.js")(logger.create("endpoints"), routerEndpoints);     // <host>/api/endpoints
    require("./device.interfaces.js")(logger.create("interfaces"), routerDevices);     // <host>/api/devices/<id>/interfaces
    require("./device.connector.js")(logger.create("connector"), routerDevices);       // <host>/api/devices/<id>/connector
    require("./api.scenes.js")(logger.create("scenes"), routerScenes);              // <host>/api/scenes

};