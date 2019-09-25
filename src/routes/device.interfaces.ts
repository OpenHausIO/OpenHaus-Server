import * as Express from "express";
import * as WebSocket from "ws";
import { EventEmitter } from "events";
import * as Winston from "winston";

import { IDevices } from "../database/model.devices";


export interface IAdapter {
    input: EventEmitter,
    output: EventEmitter,
    iface: EventEmitter,
    device: EventEmitter
}


export interface IRequest extends Express.Request {
    doc: IDevices, //Document
    adapter?: IAdapter,
    interface?: Object
}


const logger = require("../logger/index.js");
const adapter = require("./middleware/adapter.js");

const mwAdapter = adapter(logger.create("adapter"));



function isWebSocketRequest(req: IRequest) {

    if (
        req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket" &&
        req.headers.connection && req.headers.connection.toLowerCase() === "upgrade"
    ) {
        return true;
    }

    return false;

}


const { interfaces } = require("./states.js");



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





    router.get("/:_id/interfaces/:iface", mwAdapter, (req: IRequest, res) => {
        if (isWebSocketRequest(req)) {

            // req.adapter = adapter handler instance


            // create server
            // if no one exists for the interface
            if (!interfaces.has(req.params.iface)) {

                const wss = new WebSocket.Server({
                    noServer: true
                });

                interfaces.set(req.params.iface, wss);

            }


            // get websocket server for interface
            const wss = interfaces.get(req.params.iface);


            // hanlde websocket upgrade
            // this is the raw communication with the device interface
            wss.handleUpgrade(req, req.socket, req.headers, (ws: WebSocket) => {


                ws.on("close", () => {
                    log.warn("Disconnected, %s", req.params.iface);
                    req.adapter.iface.emit("disconnected", ws);
                });


                //NOTE nur eine interface verbindung pro connector!!!!
                //NOTE HIER SOLLTE KEINE LOOP ENTSTEHEN, DENNOCH NICHT BEST PRACTICE!!!!
                // adapter -> connector -> device (interface)
                req.adapter.output.on("data", (data) => {
                    log.debug("Message to interface (%s)", req.params.iface, data);
                    ws.send(data);
                });


                // data from interface
                // device (interface) -> connector -> adapter
                ws.on("message", (data) => {
                    log.debug("Message from interface (%s)", req.params.iface, data);
                    req.adapter.input.emit("data", data);
                });


                setImmediate(() => {

                    // feedback
                    log.info("Connected (%s)", req.params.iface);

                    // emit connection event
                    wss.emit("connection", ws, req);
                    req.adapter.iface.emit("connected", ws);

                });


            });


        } else {

            // no websocket request received
            // send interface object to client
            res.json(req.interface);

        }
    });

};