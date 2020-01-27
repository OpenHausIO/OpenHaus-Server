import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import * as adapterInstances from "./adapter";
import { IEndpoint } from './database/model.endpoints.js';
import { EventEmitter } from "events";


const model = mongoose.model("Endpoints");
//@ts-ignore
const log = logger.create("endpoint");
const Commander = require("./commander.js");

// eine commander instance per interface/interface-stream
// 

// key = endpoint id
// values = array of interfaces
const ENDPOINT_INTERFACES = new Map();

// key = interface id
// value = commander instance
const INTERFACE_COMMANDER = new Map();

// for receiving & transmit commands
const events = new EventEmitter();


model.find({
    //TODO: enabled = true?
}).lean().exec((err, endpoints) => {

    if (err) {
        log.error(err, "could not fetch endpoints");
        process.exit();
    }

    // feedback
    log.verbose("%d enabled endpoints found", endpoints.length);


    endpoints.forEach((endpoint: IEndpoint) => {

        let interfaces: Array<String> = [];

        endpoint.commands.forEach((command) => {
            //@ts-ignore
            if (!interfaces.includes(command.interface)) {
                //@ts-ignore
                interfaces.push(command.interface);

                // filter only commands for interface xxx
                let ifaceCmds = endpoint.commands.filter((e) => {
                    e.interface === command.interface;
                });

                //@ts-ignore
                let adapter = adapterInstances.get(command.interface);
                let commander = new Commander(ifaceCmds, adapter);
                INTERFACE_COMMANDER.set(command.interface, commander);


                commander.on("command", (...args: any[]) => {
                    //this.emit("command")
                    console.log("<CMD:received>", args, endpoint);
                    //FIXME apply(<this> = events ?)
                    events.emit.apply(events, ["command.received", ...args, endpoint]);
                });

            }
        });

        ENDPOINT_INTERFACES.set(String(endpoint._id), interfaces);

    });


    console.log("EI", ENDPOINT_INTERFACES);
    console.log();
    console.log();
    console.log("IC", INTERFACE_COMMANDER);


    /*
    let commands = {};


    endpoints.forEach((endpoint: IEndpoint) => {

        // filter commands by interface
        endpoint.commands.forEach((command: ICommand) => {

            //@ts-ignore
            if (!commands[command.adapter]) {
                //@ts-ignore
                commands[command.adapter] = [];
            }

            //@ts-ignore
            commands[command.adapter].push(command);

        });

        Object.keys(commands).forEach((k) => {
            //@ts-ignore
            let adapter = adapterInstances.get(k);
            //@ts-ignore
            let commander = new Commander(commands[k], adapter);
        });


    });
*/

});


events.on("command.transmit", (cmd_obj, params) => {
    if (INTERFACE_COMMANDER.has(cmd_obj.interface)) {

        let commander = INTERFACE_COMMANDER.get(cmd_obj.interface);

        try {
            // submit command
            // 1) compile command template
            // 2) write compiled string to adapter
            // 3) pipe packet over interface stream (ws) to connector
            // 4) connector write over transport protocol (tcp/udp) to device interface
            commander.submit(cmd_obj._id, params);
        } catch (e) {

            // feedback
            log.warn("Could not submit command (%d) to device interface", e);

        }

    } else {

        log.warn("No commaner instance found for command/interface %s", cmd_obj.interface);

    }
});