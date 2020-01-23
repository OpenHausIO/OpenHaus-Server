import * as Express from "express";
import { IEndpoint, ICommand } from "../database/model.endpoints";
//import { ObjectId } from "bson";
import * as Winston from "winston";
//import * as Joi from "joi";
import { __values } from 'tslib';


interface IRequest extends Express.Request {
    doc: IEndpoint,
    command: ICommand,
}


//const { adapter } = require("./states.js");


module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {


    router.param("cmd", (req: IRequest, res, next, _id) => {

        req.command = req.doc.commands.find(e => {
            return e._id == _id;
        });

        if (!req.command) {
            return res.status(404).end("COMMAND_NOT_FOUND");
        }

        next();

    });


    router.get("/:_id/commands", (req: IRequest, res) => {
        res.json(req.doc.commands);
    });


    router.get("/:_id/commands/:cmd", (req: IRequest, res) => {
        res.json(req.command);
    });



    router.post("/:_id/commands/:cmd", (req: IRequest, res) => {

        console.log("Send command")

    });


    /*
    router.post("/:_id/commands/:cmd", (req: IRequest, res) => {
        if (adapter.has(req.command.interface.toString())) {

            // feedback
            log.debug("Command: %j, body/params: %j", req.command, req.body);
            const handler = adapter.get(req.command.interface.toString());


            try {

                // validation schema
                let schema = {};

                //@ts-ignore
                req.command.params.forEach(param => {
                    if (param.value.type) {

                        // FIXME Chaining required?!?!?!??!?!
                        // TODO Test without chaining!

                        //@ts-ignore
                        schema[param.key] = Joi[param.value.type]();
                        delete param.value.type;


                        if (!param.value.default) {
                            //@ts-ignore
                            schema[param.key] = schema[param.key].required();
                        }


                        Object.keys(param.value).forEach((k) => {
                            //@ts-ignore
                            schema[param.key] = schema[param.key][k](param.value[k]);
                        });


                        //NOTE try with Array.reduce?!, if chainging required!
                        /*
                                Object.keys(param.value).reduce((acc, k) => {                        
                                    return schema[param.key][k](param.value[k]);                        
                                }, schema[param.key]);
                        *

                    } else {

                        // stop foreach loop
                        throw new Error("INVALID_PARAMS");

                    }
                });


                //@ts-ignore
                schema.validate(req.body).then((values) => {


                    // feedback
                    log.verbose("Command params validation passed");
                    log.debug("Send command to adapter handler interface eventemitter");


                    // let adapter handler protol implementation
                    handler.iface.emit("command", req.command, values);


                    // wait that adapter handler has done his job
                    handler.output.once("command", (data: any) => {
                        log.debug("Adapter handler sendet command");
                        res.end(data);
                    });


                }).catch((e: Error) => {

                    // feedback
                    log.verbose("Command params validation failed!");
                    log.notice("User send invalid command params", req.command, req.body);
                    res.status(400).end("INVALID_COMMAND_PARAMS");

                });

            } catch (e) {

                log.notice("Invalid params passed, %j, got %j", req.command.params, req.body);
                return res.status(400).end("INVALID_PARAMS");

            }


        } else {

            log.notice("No connection for interface (%s) etablished!", req.command.interface.toString());
            return res.status(500).end("IFACE_NOT_CONNECTED")

        }
    });
*/

};