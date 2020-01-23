import * as Express from "express";
import * as WebSocket from "ws";
import { EventEmitter } from "events";
import * as Winston from "winston";

import { IDevice, IInterface } from "../database/model.devices";


export interface IAdapter {
    input: EventEmitter,
    output: EventEmitter,
    iface: EventEmitter,
    device: EventEmitter
}


export interface IRequest extends Express.Request {
    doc: IDevice, //Document
    adapter?: IAdapter,
    interface?: IInterface
}


//const logger = require("../logger/index.js");
//const adapter = require("./middleware/adapter.js");
const interfaces = require("../interfaces.js");
//const mwAdapter = adapter(logger.create("adapter"));

const WSSERVER = new Map();

function isWebSocketRequest(req: IRequest) {

    if (
        req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket" &&
        req.headers.connection && req.headers.connection.toLowerCase() === "upgrade"
    ) {
        return true;
    }

    return false;

}


//const { interfaces } = require("./states.js");



module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {


    router.param("iface", (
        req: IRequest,
        res,
        next,
        iface
    ) => {

        req.interface = req.doc.interfaces.find(e => {
            return e._id == iface;
        });

        if (!req.interface) {
            return res.status(404).end("INTERFACE_NOT_FOUND");
        }

        next();

    });



    router.get("/:_id/interfaces", (req: IRequest, res) => {
        res.json(req.doc.interfaces);
    });





    router.get("/:_id/interfaces/:iface", (req: IRequest, res) => {
        if (isWebSocketRequest(req)) {

            // req.adapter = adapter handler instance


            // create server
            // if no one exists for the interface
            if (!WSSERVER.has(req.params.iface)) {

                const wss = new WebSocket.Server({
                    noServer: true
                });

                WSSERVER.set(req.params.iface, wss);

            }


            // get websocket server for interface
            const wss = WSSERVER.get(req.params.iface);


            // hanlde websocket upgrade
            // this is the raw communication with the device interface
            wss.handleUpgrade(req, req.socket, req.headers, (ws: WebSocket) => {
                if (interfaces.has(String(req.interface._id))) {


                    let stream = interfaces.get(String(req.interface._id));

                    log.info("WebSocket connected on '%s'", req.interface._id); //req.interface._id -> stream._id ?! ist schon "stringified"

                    ws.on("message", (data) => {
                        console.log("device.interfaces.ts, 118 >", data);
                    });

                    stream.attach(ws);

                    ws.on("close", () => {
                        log.info("WebSocket disconnected on '%s'", req.interface._id);
                        stream.detach(ws);
                    });

                } else {

                    log.warn("Interface '%s' in interface streams not found!", req.interface._id);

                }
            });



        } else {

            // no websocket request received
            // send interface object to client
            res.json(req.interface);

        }
    });

};