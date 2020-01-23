import * as mongoose from "mongoose";
import * as logger from "./logger/index.js";
import { IDevice } from "./database/model.devices";
//@ts-ignore
import * as interfaceStream from "interface-stream";

const interfaces = new Map();

const model = mongoose.model("Devices");
//@ts-ignore
const log = logger.create("interfaces");

model.find({}).lean().exec((err, devices) => {

    if (err) {
        log.error(err);
        process.exit();
    }

    // feedback
    log.verbose("Devices fetched: %d, create streaming interface", devices.length);

    devices.forEach((device: IDevice) => {
        device.interfaces.forEach((iface) => {

            let duplex = new interfaceStream({
                // duplex options
            });

            Object.assign(duplex, iface);
            interfaces.set(iface._id, duplex);

            //console.log(duplex)

            // feedback
            log.verbose("Duplex Stream Interface created for: %s", duplex._id);


        });
    });

});

module.exports = interfaces;