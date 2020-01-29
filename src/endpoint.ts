import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import * as adapterInstances from "./adapter";
import { IEndpoint, ICommand } from './database/model.endpoints.js';
import { EventEmitter } from "events";
import { ICommander } from "./commander";


const model = mongoose.model("Endpoints");
//@ts-ignore
const log = logger.create("endpoint");
const Commander = require("./commander.js");

// eine commander instance per interface/interface-stream
// 

// key = endpoint id
// values = array of interfaces
const ENDPOINT_INTERFACES = new Map<String, Array<any>>();

// key = interface id
// value = commander instance
const INTERFACE_COMMANDER = new Map<String, ICommander>();

// for receiving & transmit commands
const events = new EventEmitter();

//setTimeout(() => {

//5d8cf6d58cee5013f5971fbe
//console.log("init endpoints", adapterInstances.has("5d8cf6d58cee5013f5971fbe"), adapterInstances)

// create es5 function class
// inerhit event emitter
// add ..prototype.<method> = ... as public function 
// ja/nein ?!?! -> keep this ?!
// vorteil verwendung von "this", nachteil ?!
// prototype chain noch mal studieren bzwgl. Object.assign(..., {...})


// export component object
exports = Object.assign(events, {
    ENDPOINT_INTERFACES,
    INTERFACE_COMMANDER
});

// public scope
exports.method = () => {
    // demo
};

// mit sicht auf kommentar oben:
/*

function endpoint(id){

    this.id = id;

};

// endpoint.submit = ...; // transmit command
// endpoint.command = ...; // on received command

exports.endpoint = endpoint;

*/


// private scope
(() => {

    model.find({
        //TODO: enabled = true?
        //enabled: true // -> check in methods/events or so ?...
    }).lean().exec((err, endpoints) => {

        if (err) {
            log.error(err, "could not fetch endpoints");
            process.exit();
        }

        // feedback
        log.verbose("%d enabled endpoints fetched from database", endpoints.length);


        endpoints.forEach((endpoint: IEndpoint) => {

            let interfaces: Array<String> = [];

            endpoint.commands.forEach((command: ICommand) => {

                if (!interfaces.includes(String(command.interface))) {
                    interfaces.push(command.interface.toString());
                }

                ENDPOINT_INTERFACES.set(String(endpoint._id), interfaces);

            });



            interfaces.forEach((id) => {

                //console.log("iface:", id, endpoint.commands);


                let ifaceCmds = endpoint.commands.filter((cmd: ICommand) => {
                    return String(cmd.interface) === String(id);
                });


                //FIXME ts error, adapterInstances.get not recognized
                //@ts-ignore
                if (adapterInstances.has(String(id))) {

                    //@ts-ignore
                    let adapter = adapterInstances.get(String(id));


                    let commander = new Commander(ifaceCmds, adapter);
                    //console.log("set", id)
                    INTERFACE_COMMANDER.set(id, commander);


                    commander.on("command", (...args: any[]) => {
                        //this.emit("command")
                        console.log("<CMD:received>", args, endpoint);
                        //FIXME apply(<this> = events ?)
                        events.emit.apply(events, ["command.received", ...args, endpoint]);
                    });


                } else {

                    //console.log(adapterInstances)
                    log.warn("Could not find adapter for interface id %s, could not create endpoint commander instance!", id);

                }


            });


            process.nextTick(() => {
                log.verbose("Component ready!");
                events.emit("ready");
            });


        });


    });

    events.on("command.transmit", (cmd_obj, params) => {
        console.log("-----------------------");
        console.log();
        console.log("Now we should send", cmd_obj, params)
        if (INTERFACE_COMMANDER.has(String(cmd_obj.interface))) {

            let commander = INTERFACE_COMMANDER.get(String(cmd_obj.interface));

            try {

                console.log()

                // submit command
                // 1) compile command template
                // 2) write compiled string to adapter
                // 3) pipe chunk over interface stream (ws) to connector
                // 4) connector write chunk over transport protocol (tcp/udp) to device interface
                commander.submit(String(cmd_obj._id), params || []);

            } catch (e) {

                // feedback
                log.warn("Could not submit command (%s) to device interface", cmd_obj._id, e);
                console.log(e);

            }

        } else {

            log.warn("No commaneder instance found for command/interface %s", cmd_obj.interface);

        }
    });

})();

/*
{
       "_id": "5e29f245a2941b04ad70d29b",
        "name": "AV Receiver",
        "room": "5d6412470870c639f0f88b86",
        "icon": "fa fa-loudspeaker",
        "commands": [{
            "enabled": true,
            "_id":
                "5e29f245a2941b04ad70d29d",
            "name": "Power Ein", "payload": "PWR01", "interface": "5d8cf6d58cee5013f5971fbe", "params": []
        }, {
            "        enabled": true,
            "_id": "5e29f245a2941b04ad70d29c",
            "name": "Power Aus",
            "payload": "PWR00",
            "interface":
                "5d8cf6d58cee5013f5971fbe",
            "params": []
        }],
        "__v": 0
    }
*/

/*
setInterval(() => {

    events.emit("command.transmit", {
        "enabled": true,
        "_id": "5e29f245a2941b04ad70d29d",
        "name": "Power Ein",
        "payload": "PWR01",
        "interface": "5d8cf6d58cee5013f5971fbe",
        "params": []
    });

}, 5000);
*/

//}, 1000);

//module.exports = events; 