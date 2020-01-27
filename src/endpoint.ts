import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import * as adapterInstances from "./adapter";
import { IEndpoint } from './database/model.endpoints.js';


const model = mongoose.model("Endpoints");
//@ts-ignore
const log = logger.create("endpoint");
const Commander = require("./commander.js");

// eine commander instance per interface/interface-stream
// 

// key = endpoint id
// values = array of interfaces1
const ENDPOINT_INTERFACES = new Map();

// key = interface id
// value = commander instance
const INTERFACE_COMMANDER = new Map();


model.find({
    //TODO: enabled = true?
}).lean().exec((err, endpoints) => {

    if (err) {
        log.error(err, "could not fetch endpoints");
        process.exit();
    }


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

            }
        });

        ENDPOINT_INTERFACES.set(String(endpoint._id), interfaces);

    });


    console.log(ENDPOINT_INTERFACES)


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



