import * as Express from "express";
import { IDocument } from "../database/model.scenes";

//@ts-ignore
const { adapter } = require("./states.js");



interface IRequest extends Express.Request {
    doc: IDocument
}


//const run = require("../system/scenes/index.js");
//const fetch = require("../system/scenes/bank.js");
const run = require("../system/scenes/stack-execute.js");

module.exports = (router: Express.Router) => {

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

        res.status(206);
        res.write("OK," + Date.now() + "\n");

        const interval = setInterval(() => {
            res.write("OK," + Date.now() + "\n");
        }, 300);

        run(stack).then(() => {

            console.log("Scene done");
            clearInterval(interval);

            res.end();

            //@ts-ignore
        }).catch(e => {

            console.log("Scenen error", e);
            clearInterval(interval);

            res.end();

        });




    });

};