import * as Express from "express";
import { IScene } from "../database/model.scenes";
import * as Winston from "winston";


interface IRequest extends Express.Request {
    doc: IScene
}


const run = require("../system/scenes/stack-execute.js");
const fetch = require("../system/scenes/fetch.js");


module.exports = (
    log: Winston.Logger,
    router: Express.Router
) => {

    router.param("_id", (req, res, next, id) => {
        next();
    });

    router.post("/:_id/run", (req: IRequest, res) => {

        // feedback
        log.debug("Execute scene '%s'", req.doc.name);


        // create scene from bank
        const banks = req.doc.banks.map((e) => {
            return fetch(e);
        });


        Promise.all(banks).then((banks) => {


            // run bank stack
            const stacks = banks.map(bank => {

                // execute bank stack
                let stack = run(bank);

                // scene in bank evaluation
                stack.then(() => {
                    console.log("Stack done");
                }).catch(() => {
                    console.log("Stack error");
                });

                return stack;

            });


            // scene overall result
            Promise.all(stacks).then(() => {

                console.log("Scene done!");
                res.end("YEAH!");

            }).catch(() => {

                console.log("Scene error!");
                res.end("SCENE_ERROR");

            });


        });




    });

};