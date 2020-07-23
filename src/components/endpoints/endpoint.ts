const { EventEmitter } = require("events");
const util = require("util");

import C_ADAPTER = require("../adapter");
//import C_INTERFACES = require("../interfaces");

module.exports = (log, {
    interfaceCommands,
    commanderInstances,
    Commander
}) => {


    function Endpoint(data) {

        // add properties
        Object.assign(this, data);


        //@ts-ignore
        data.commands.map((cmd) => {
            return String(cmd.interface);
        }).forEach((_id) => {

            //@ts-ignore
            let ifaceCommands = doc.commands.filter((cmd) => {
                return cmd.interface === _id;
            });

            // store commands for interface
            interfaceCommands.set(_id, ifaceCommands);

            // get adapter instance
            //@ts-ignore
            let adapter = C_ADAPTER.instances.get(_id);

            if (!adapter) {
                log.error("Endpoint '%s' (%s) interface (%s) has no adapter assigned!", data.name, data._id, _id);
                return;
            }


            let commander = new Commander(ifaceCommands, adapter);
            commanderInstances.set(_id, commander);

            commander.on("command", (...args) => {
                this.emit.apply(this, ["command", ...args]);
            });

            // feedback
            log.verbose("Endpoint '%s' reachable over interface '%s'", data._id, _id);

        });

    }


    Endpoint.prototype.command = function (cmd_obj, params) {

        let commander = commanderInstances.get(cmd_obj.interface);

        if (!commander) {
            log.warn("Could not submit command, commander instance not found: %j", {
                cmd_obj,
                params
            });
            return;
        }

        commander.submit(cmd_obj, params);

    }


    // inherit EventEmitter
    util.inherits(Endpoint, EventEmitter);


    return Endpoint;


};