import * as Express from "express";
import { IEndpoints, ICommand } from "../database/model.endpoints";
//import { ObjectId } from "bson";
import * as Winston from "winston";
import * as Joi from "joi";

interface IRequest extends Express.Request {
    doc: IEndpoints,
    command: ICommand,
}


const { adapter } = require("./states.js");


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

    });


    router.get("/:_id/commands", (req: IRequest, res) => {
        res.json(req.doc.commands);
    });


    router.get("/:_id/commands/:cmd", (req: IRequest, res) => {

    });


    router.post("/:_id/commands/:cmd", (req: IRequest, res) => {
        if (adapter.has(req.command.interface.toString())) {

            // feedback
            log.debug("Command: %j, body/params: %j", req.command, req.body);


            const handler = adapter.get(req.command.interface.toString());


            // validat command parmeter
            const validate = Joi.object({
                // command.params 
            });


            //@ts-ignore
            validate.then((values) => {


                // feedback
                log.verbose("Command params validation passed");
                log.debug("Send command to adapter handler interface eventemitter");


                // let adapter handler protol implementation
                handler.iface.emit("command", req.command, values);


                // wait that adapter handler has done his job
                handler.output.once("command", () => {
                    log.debug("Adapter handler sendet command");
                    res.end();
                });


            }).catch((e: Error) => {

                // feedback
                log.notice("User send invalid command params", req.command, req.body);
                res.status(400).end("INVALID_COMMAND_PARAMS");

            });


        } else {

            //TODO was von den drei ist nicht existent?
            log.verbose("Adapter/interface/device (%s) not connected", req.command.interface.toString());
            res.status(500).end("IFACE_NOT_CONNECTED")

        }
    });


};