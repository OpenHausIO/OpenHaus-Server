import * as Express from "express";
import * as WebSocket from "ws";
import * as Winston from "winston";

const { connector } = require("./states.js");

import { IRequest } from "./api.interfaces";



function isWebSocketRequest(req: IRequest) {

    if (
        req.headers.upgrade && req.headers.upgrade.toLowerCase() === "websocket" &&
        req.headers.connection && req.headers.connection.toLowerCase() === "upgrade"
    ) {
        return true;
    }

    return false;

}


module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {

    router.get("/:_id/connector", (
        req: IRequest,
        res
    ) => {



        // WHAT DO WE HERE?:
        // - send interfaces to connector
        // - broadcast states between connector/adapter
        // - handle/broadcast interfaces states (end,streams, etc...)
        //TODO Connector <> Adapter events

        if (!connector.has(req.params._id)) {

            const wss = new WebSocket.Server({
                noServer: true
            });

            connector.set(req.params._id, wss);

        }


        // get websocket server for interface
        const wss = connector.get(req.params._id);


        if (!isWebSocketRequest(req)) {
            return res.status(405).end("MUST_BE_A_WS_CONNECTION");
        }

        // hanlde websocket upgrade
        wss.handleUpgrade(req, req.socket, req.headers, (ws: WebSocket) => {


            ws.on("close", () => {
                log.warn("Disconnected, %s", req.params._id);
                //connector.delete(); ?
            });


            setImmediate(() => {

                // feedback
                log.info("Connector: connected, %s", req.params._id);

                // emit connection event
                wss.emit("connection", ws, req);

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


};