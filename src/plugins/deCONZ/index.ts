import winston = require("winston");
//import C_DEVICES = require("../../components/devices");
import request = require("../../system/requests");
//import C_UPNP = require("../../components/upnp"); --> @TODO
import C_ENDPOINTS = require("../../components/endpoints");
import { EventEmitter } from 'events';
import WebSocket = require("ws");

// https://dresden-elektronik.github.io/deconz-rest-doc/
// https://dresden-elektronik.github.io/deconz-rest-doc/websocket/
// https://dresden-elektronik.github.io/deconz-rest-doc/authorization/

const API_KEY = process.env.API_KEY || "0AF12B2A73";
const API_URL = `http://192.168.2.4/api/${API_KEY}`;

// process.env.PLUGIN_DECONZ_API_KEY


//@ts-ignore
request.request(`${API_URL}/config`, (err, info, body) => {
    //let json = JSON.parse(body);
    // console.log(info, json);
});






module.exports = (log: winston.Logger) => {

    // feedback
    log.info("Plugin init");


    // ws://licht.lan:443
    // `ws://echo.websocket.org`
    const ws = new WebSocket(`ws://192.168.2.4:443`);

    ws.on("open", () => {
        log.debug("Connected to WebSocket: %s", ws.url);
    });

    ws.on("close", () => {
        log.warn("WebSocket closed");
    });

    //@ts-ignore
    ws.on("message", (json: String) => {
        //@ts-ignore
        json = JSON.parse(json);
        console.log(json)
    });

    ws.on("error", (err) => {
        //@ts-ignore
        log.error(err, null);
    });






    const events = new EventEmitter();

    require("./get-lights")(log, events);
    require("./set-state")(log, events);


    (() => {

        console.log("set light on");

        const STATE = false;

        events.emit("lights.set", "1", {
            on: STATE
        });

        events.emit("lights.set", "2", {
            on: STATE
        });

        events.emit("lights.set", "3", {
            on: STATE
        });

        events.emit("lights.set", "4", {
            on: STATE
        });

        events.emit("lights.set", "5", {
            on: STATE
        });

        events.emit("lights.set", "6", {
            on: STATE
        });

        events.emit("lights.set", "7", {
            on: STATE
        });

        events.emit("lights.set", "8", {
            on: STATE
        });

        events.emit("lights.set", "9", {
            on: STATE
        });

        events.emit("lights.set", "10", {
            on: STATE
        });

    });


    //@ts-ignore
    C_ENDPOINTS.events.on("refreshed", (endpoints) => {
        console.log("[%s] refreshed:", endpoints, __filename)
    });


    events.on("endpoints.added", (docs) => {
        //@ts-ignore
        log.verbose("Endpoints added, refresh endpoints list");
        //@ts-ignore
        C_ENDPOINTS.refresh();
    });

};