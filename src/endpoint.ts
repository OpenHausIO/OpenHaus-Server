import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import * as adapterInstances from "./adapter";
import { IEndpoint } from './database/model.endpoints.js';


const model = mongoose.model("Endpoints");
//@ts-ignore
const log = logger.create("endpoint");
const Commander = require("./commander.js");


model.find({
    //TODO: enabled = true
}).lean().exec((err, endpoints) => {

    if (err) {
        log.error(err, "could not fetch endpoints");
        process.exit();
    }


    endpoints.forEach((endpoint: IEndpoint) => {



        const { transmit, receive } = new Commander(endpoint.commands, adapterInstances);


    });


});
