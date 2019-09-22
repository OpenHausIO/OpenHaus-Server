import * as Express from "express";
import { IEndpoints } from "../database/model.endpoints";
import { ObjectId } from 'bson';

interface IRequest extends Express.Request {
    doc: IEndpoints,
    iface: ObjectId
}


const { adapter } = require("./states.js");


module.exports = (router: Express.Router) => {

    router.use((
        req,
        res,
        next
    ) => {

        console.log(req.url);
        next();

    });


    router.get("/:_id/commands", (req: IRequest, res, next) => {
        res.json(req.doc.commands);
    });



    router.post("/:_id/commands/:cmd", (req: IRequest, res) => {


        const command = req.doc.commands.find(e => {
            return e._id == req.params.cmd;
        });


        if (!command) {
            return res.status(404).end("CMD_NOT_FOUND");
        }


        //@ts-ignore
        if (adapter.has(command.interface.toString())) {

            //@ts-ignore
            const adapt = adapter.get(command.interface.toString());
            adapt.iface.emit("command", command, req.body);

            res.end();

        } else {

            res.status(500).end("IFACE_NOT_CONNECTED")

        }

    });


};