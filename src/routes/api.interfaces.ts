import * as Express from "express";
import * as WebSocket from "ws";
import { EventEmitter } from 'events';
//const debug = require("debug")("OpenHaus:Server.api.interfaces");

import { IDevices } from "../database/model.devices";

export interface IHandele {
    input: EventEmitter,
    output: EventEmitter,
    iface: EventEmitter,
    device: EventEmitter
}



export interface IRequest extends Express.Request {
    doc: IDevices, //Document
    adapter: IHandele,
    interface: any
    states: {
        interfaces: Map<String, WebSocket.Server>,
        connector: Map<String, WebSocket.Server>,
        adapter: Map<String, IHandele>
    }
}



// NOTE
// https://areknawo.com/node-js-file-streams-explained/

//TODO 
// - implement user/connection validation with JWT
// - add logger to all kind of things



const mwAdapter = require("./middleware/adapter.js")();
//const mwWebSocket = require("./middleware/adapter.js")();




const logger = require("../logger/index.js");
const log = logger.create("interfaces");




function isWebSocketRequest(req: IRequest) {

    if (
        req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket" &&
        req.headers.connection && req.headers.connection.toLowerCase() === "upgrade"
    ) {
        return true;
    }

    return false;

}


const { interfaces, connector, adapter } = require("./states.js");


module.exports = (router: Express.Router) => {


    router.use((
        req: IRequest,
        res,
        next
    ) => {

        req.states = {
            interfaces,
            connector,
            adapter
        };

        next();

    });


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



    router.get("/:_id/connector", (
        req: IRequest,
        res
    ) => {

        // WHAT DO WE HERE?:
        // - send interfaces to connector
        // - broadcast states between connector/adapter
        // - handle/broadcast interfaces states (end,streams, etc...)
        //TODO Connector <> Adapter events

        if (!connector.has(req.doc._id)) {

            const wss = new WebSocket.Server({
                noServer: true
            });

            connector.set(req.doc._id, wss);

        }


        // get websocket server for interface
        const wss = connector.get(req.doc._id);


        if (!isWebSocketRequest(req)) {
            return res.status(405).end("MUST_BE_A_WS_CONNECTION");
        }

        // hanlde websocket upgrade
        wss.handleUpgrade(req, req.socket, req.headers, (ws: WebSocket) => {

            ws.on("close", () => {
                log.warn("Connector: disconnected, %s", req.params._id);
            });



            setImmediate(() => {

                // feedback
                log.info("Connector: connected, %s", req.params._id);

                // emit connection event
                wss.emit("connection", ws, req);
                //TODO, take a look on TODOs.md
                //req.states.device.emit("connected"); -> NEEDED?!

                // format message
                const message = JSON.stringify({
                    event: ":interfaces",
                    data: req.doc.interfaces
                });

                // send interfaces to connector
                ws.send(message);

            });


        });

    });



    router.get("/:_id/interfaces", (req: IRequest, res) => {
        res.json(req.doc.interfaces);
    });


    router.get("/:_id/interfaces/:iface", mwAdapter, (req: IRequest, res) => {
        if (isWebSocketRequest(req)) {


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

                // NOTE req.adapter.iface.emit add <ws> as parameter?


                ws.on("close", () => {
                    log.warn("Interface: disconnected, %s", req.params.iface);
                    req.adapter.iface.emit(":disconnected", ws);
                });


                //NOTE nur eine interface verbindung pro connector!!!!
                //NOTE HIER SOLLTE KEINE LOOP ENTSTEHEN, DENNOCH NICHT BEST PRACTICE!!!!
                // adapter -> connector -> device (interface)
                req.adapter.output.on("data", (data) => {
                    ws.send(data);
                });


                // data from interface
                // device (interface) -> connector -> adapter
                ws.on("message", (data) => {
                    req.adapter.input.emit("data", data);
                });


                setImmediate(() => {

                    // feedback
                    log.info("Interface: connected, %s", req.params.iface);

                    // emit connection event
                    wss.emit("connection", ws, req);
                    req.adapter.iface.emit(":connected", ws);

                });


            });


        } else {

            // no websocket request received
            // send interface object to client
            res.json(req.interface);

        }
    });


    router.get("/:_id/interfaces/:iface/commands", (req: IRequest, res) => {
        res.json(req.interface.commands);
    });


    router.get("/:_id/interfaces/:iface/commands/:cmd", (req: IRequest, res) => {

        //@ts-ignore
        const command = req.interface.commands.find(e => {
            return e._id == req.params.cmd;
        });

        if (!command) {
            return res.status(404).end();
        }

        res.json(command);

    });

};