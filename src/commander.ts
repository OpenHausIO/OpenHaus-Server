// https://gist.github.com/smeijer/6580740a0ff468960a5257108af1384e
// https://gist.github.com/shannonmoeller/b4f6fbab2ffec56213e7
// https://regexr.com/4riep



const { EventEmitter } = require("events");
const util = require("util");

import { PassThrough, Writable } from "stream";
import { ICommand } from './database/model.endpoints';

/*

// TODO
 1) commands durch gehen 
 2) prüfen ob interface in in adapters
 3) ....




 //TODO FIXME-LIST
 - Nur string templates "compilen" 
 - Binary payload plain schicken
 - String/template encoding ?
 - Pipline noch mal durchdenken


*/


/**
 * Constructur
 * @param {array} commands 
 */
function Commander(commands: ICommand, adapter: any) {

    console.log("commander", commands)

    this.adapter = adapter;
    this.commands = commands || [];
    EventEmitter.call(this);

    this.streams = ((commander) => {


        //const transmitter = module.exports.transmitter = new PassThrough();
        //const writable = module.exports.receiver = new Writable();
        const transmitter = new PassThrough();
        const writable = new Writable();


        writable._write = (chunk, encoding, cb) => {
            //console.log("from device > ", String(chunk))
            commander.parse(String(chunk), (cmd: ICommand, params: Object) => {

                commander.emit("command", cmd, params);

            });
        };

        return {
            transmit: transmitter,
            receive: writable
        };

    })(this);

    adapter.receive.on("readable", () => {
        this.parse(adapter.receive.read(), (cmd_obj: ICommand, params: Object) => {

            //console.log("from device", cmd_obj, params);
            this.emit("command", cmd_obj, params);

        });
    });

}

// inherit EventEmitter
util.inherits(Commander, EventEmitter);


/**
 * Compile a payload string
 * @param {string} payload
 * @param {object} data
 */
Commander.prototype.compile = function compile(payload: String, data: Object) {
    return payload.replace(/{.+?}/g, (match) => {
        const path = match.substr(1, match.length - 2).trim();
        //@ts-ignore
        return data[path] || `{${path}}`;
    });
};


/**
 * Parse a command and returns the command object
 * @param {object} data
 * @param {function} cb
 */
Commander.prototype.parse = function parse(data: String, cb: Function) {

    // https://stackoverflow.com/questions/59570984/regex-pattern-simple-string-payload-object-mapping

    //@ts-ignore
    let cmd_obj: ICommand = {};

    // filter all possible commands
    // POWER_TOGGLE or POWER_{state} can be missmatched
    // so we try to filter this with a string comparison
    const list = this.commands.filter((cmd: ICommand) => {
        const regex = cmd.payload.replace(/{.+?}/g, "(.*)");
        //@ts-ignore
        return new RegExp(regex, "g").test(data);
    });

    //console.log("cmd list:", list, this.commands, data)

    if (!(list.length > 0)) {
        console.log("no possible command found, ignore");
        //@ts-ignore
        //log.warn("No possible command found in command array", this.commands, data.payload);
        return;
    }

    // compare command payload
    // with command string
    if (list.length > 1) {

        cmd_obj = list.find((cmd: ICommand) => {
            return cmd.payload === data;
        });
        //console.log("list length > 1", cmd_obj);
    } else {

        cmd_obj = list[0];
        //console.log("list lenght = 1", cmd_obj);
    }


    //@ts-ignore
    if (cmd_obj.params.length > 0) {

        //console.log("Command has parameter, parse", cmd_obj)

        //@ts-ignore
        const names = cmd_obj.payload.match(/[^\{\}]+(?=\})/g);
        //@ts-ignore
        const regex = cmd_obj.payload.replace(/{.+?}/g, "(.*)");
        const values = String(data).match(new RegExp(regex)).slice(1);


        console.log(names, regex, values)

        if (names.length !== values.length) {
            return console.log("missmatch");
        }


        // polyfill for Object.fromEntries
        // https://github.com/feross/fromentries
        const params = ((iterable) => {
            return [...iterable].reduce((obj, [key, val]) => {
                obj[key] = val;
                return obj;
            }, {});
        })(names.map((s: any, i: any) => {
            return [s, values[i]]
        }));


        cb(cmd_obj, params);

    } else {

        // we are done here
        cb(cmd_obj, []);

    }

};


/**
 * Compile and write payload to transmitter stream
 * @param {string} id
 * @param {object} params
 */
Commander.prototype.submit = function submit(id: String, params: Object) {

    const cmd = this.commands.find((e: ICommand) => {
        return String(e._id) === id;
    });

    const payload = this.compile(cmd.payload, params);
    //this.streams.transmitter.write(payload);

    //let adapter = this.adapters.get(cmd.adapter);

    if (!this.adapter) {
        throw new Error("NO_ADAPTER_INSTANCE_FOUND");
    }

    // write to adapter
    this.adapter.transmit.write(payload);

    return payload;

};


module.exports = Commander;