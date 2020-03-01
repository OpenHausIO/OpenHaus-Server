import winston = require("winston");
//import ENDPOINTS = require("../../components/endpoints");
import INTERFACES = require("../../components/interfaces");
import DEVICES = require("../../components/devices");
import WebSocket = require("ws");
//import { Duplex } from 'stream';
import { Agent } from 'http';

//
//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "";

// NOTES
// https://github.com/Ape/samsungctl#key-codes
// ed.edenTV.update -> ?
// https://github.com/Ape/samsungctl/issues/93#issuecomment-449612166
// https://github.com/Ape/samsungctl/issues/22
// https://github.com/Ape/samsungctl/issues/22#issuecomment-341980253

// samsung TVs
// 192.168.2.103 -> Wohnzimmer
// 192.168.2.108 -> Schlafzimmer

function base64Encode(str) {
    return Buffer.from(str).toString('base64');
};





var appname = base64Encode("SamsungTvRemote2");
var baseURL = "wss://192.168.2.108:8002/api/v2/channels/samsung.remote.control?name=" + appname


function getToken() {
    var uri = baseURL;
    console.log('URL: ' + uri)
    let ws = new WebSocket(uri, {
        rejectUnauthorized: false
    });

    ws.on('message', (response) => {
        console.log("SOCKET 1 RECEIVED: " + response);

        //@ts-ignore
        var data = JSON.parse(response);

        if (data.event === "ms.channel.connect") {
            console.log("YOUR TOKEN IS:" + data.data.token);
        }
    })
}


getToken();


module.exports = (log: winston.Logger) => {

    // feedback
    log.info("Hello from Samsung TV plugin");


    //@ts-ignore
    function go() {


        //@ts-ignore
        let device = DEVICES.DEVICES.find((e) => {
            return e.name === "Fernseher (Schlafzimmer)";
        });

        // we are only interested in the websocket interface
        let iface = device.interfaces.find((e) => {
            return e.settings.port === 8001 && e.settings.protocol === "ws";
        });

        if (!iface) {
            log.warn("TV has no WebSocket interface");
            log.debug("@todo implement legacy support?");
            return;
        }


        // shortcuts
        const settings = iface.settings;
        const httpAgent = new Agent();
        //const appName = new Buffer("OpenHaus").toString("base64"); -> bringt nix
        const appName = "OpenHaus-asdfasdfasdfasdfasdfasdfasdfasdfasdfasdf";

        // override default createConnection
        // we use our websocket duplex stream wrapper here
        //@ts-ignore
        httpAgent.createConnection = function (...args) {

            // feedback
            log.verbose("Create connection called", args);

            // get interface duplex stream
            //@ts-ignore
            return INTERFACES.INTERFACES.get(String(iface._id));

        };

        // 8001 = ws
        // 8002 = wss


        // create websocket bridge to our tv
        // &token=asdfasdfasfd
        //const ws = new WebSocket(`ws://${settings.host}:${settings.port}/api/v2/channels/samsung.remote.control?name=${appName}`, ["ws", "http"], {
        //@ts-ignore
        const ws = new WebSocket(`ws://${settings.host}:${settings.port}/api/v2/channels/samsung.remote.control?name=${appName}`, {
            //@ts-ignore
            rejectUnauthorized: false,
            requestCert: true,
        });


        // listen for messages
        ws.on("message", (data: any) => {

            data = JSON.parse(data);
            log.debug("Data from device received: %j", data);

            if (data.event === "ms.channel.error") {
                log.warn("error from device: %j", data);
            }

            if (data.event !== "ms.channel.connect") {
                log.warn("Connection handshake went wrong");
            } else {

                // feedback
                log.info("Connection handshake with TV done, ready to do stuff");

                setInterval(() => {

                    let message = {
                        "method": "ms.remote.control",
                        "params": {
                            "Cmd": "Click",
                            "DataOfCmd": "KEY_CHUP",
                            "Option": "false",
                            "TypeOfRemote": "SendRemoteKey"
                        }
                    };


                    // feedback
                    log.verbose("Send key code: '%s'", message.params.DataOfCmd);

                    // send string to websocket interface
                    ws.send(JSON.stringify(message));

                }, 15000);

            }

        });

        ws.on("open", () => {
            log.debug("connected to: '%s'", ws.url);
        });

        ws.on("close", () => {
            log.debug("disconnected from: '%s'", ws.url);
        });

        ws.on("error", (e) => {
            //@ts-ignore
            log.error(e, "WebSocket connection Error, %s", e.message);
        });

    }



    //@ts-ignore
    if (!DEVICES.ready) {
        //@ts-ignore
        //DEVICES.events.on("ready", go);
    } else {
        //go();
    }


}