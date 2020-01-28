import * as Express from "express";
import { IEndpoint, ICommand } from "../database/model.endpoints";
//import { ObjectId } from "bson";
import * as Winston from "winston";
//import * as Joi from "joi";
import { __values } from 'tslib';

const events = require("../endpoint.js");

interface IRequest extends Express.Request {
    doc: IEndpoint,
    command: ICommand,
}


//const { adapter } = require("./states.js");
//const endpoints = require("../endpoint.js");


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

        console.log("Send command", req.command, req.body);

        //endpoints.emit("command.transmit", req.command, req.body);


        events.emit("command.transmit", req.command);

    });


};