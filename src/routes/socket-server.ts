import * as Express from "express";
import { json } from "body-parser";
import { model } from "mongoose";
import * as Net from "net";
import { IncomingMessage, ServerResponse } from 'http';
import { IResponse } from './rest-handler';

const logger = require("../logger/index.js");
const handler = require("./rest-handler.js");
const restHandler = handler(logger.create("socket-server"));

const app = Express();
const api = Express.Router();

app.use("/api", api);
var server: Net.Server = null;

module.exports = function (
    req: IncomingMessage,
    res: ServerResponse
) {
    app(req, res);
    server = this;
};

api.use(json());


const routerUsers = Express.Router();


restHandler(model("Users"), routerUsers);


routerUsers.use((req, res: IResponse) => {
    if (req.method === "PUT" && res.result) {

        server.close(() => {
            //console.log("server closed!");
        });

    }
});


api.use("/users", routerUsers);