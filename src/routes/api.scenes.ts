import * as Express from "express";
import { IDocument } from "../database/model.scenes";
import * as Winston from "winston";


interface IRequest extends Express.Request {
    doc: IDocument
}


//const run = require("../system/scenes/index.js");
//const fetch = require("../system/scenes/bank.js");
const run = require("../system/scenes/stack-execute.js");

module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {

    router.post("/:_id/run", (req: IRequest, res) => {

        const stack = [{
            "_id": "5d7699d837a1c91651a32fff",
            "name": "An",
            "params": {
                "nr": 4,
                "on": true
            },
            "interface": "5d72bf69e60bcd40820da9ca"
        }, {
            makro: "sleep",
            options: {
                ms: 10000
            }
        },
        {
            "_id": "5d7699d837a1c91651a32ffe",
            "interface": "5d72bf69e60bcd40820da9ca",
            "name": "Aus",
            "params": {
                "nr": 4,
                "on": false
            }
        }];


        run(stack).then(() => {

            log.info("Scene '%s' done", "<example>");
            res.status(200).end();

            //@ts-ignore
        }).catch(e => {

            log.warn("Scenen error", e);
            res.status(500).end();

        });




    });

};