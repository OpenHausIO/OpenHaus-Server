"use strict";

// https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722

import * as mongoose from "mongoose";
import { ObjectId } from 'bson';

//NOTE NEEDED?!?!?!??!
//import { IDevice } from "./interface.devices";?!?!?!?


// @TODO make interfaces required!!!!
// @TODO dynamic schema definiont for interfaces:
// e.g. type = RS232 make configuration object = {
// baudRate: ...
// stopBits: 2
// ...
//}
// type = IR config.type = philips/NEC etc...
// type = ethernet, config.services = [ws,http,upnp]
// https://stackoverflow.com/questions/28166463/how-to-create-mongoose-schema-dynamically



enum InterfaceTypes {
    "RS232",
    "ETHERNET"
}


export interface IInterfaces {
    _id: ObjectId,
    type: InterfaceTypes,
    adapter: ObjectId,
    settings: Object
}

export interface IDevices {
    _id: ObjectId,
    name: String,
    icon: String,
    room?: ObjectId,
    adapter?: ObjectId,
    meta?: {
        manufacturer?: String,
        model?: String,
        web?: String,
        revision?: Number
    },
    interfaces: Array<IInterfaces>
}


const ENUM_SETTINGS = {
    "RS232": {

    },
    "ETHERNET": {

    }
}

const interfaceSchema = new mongoose.Schema({

});


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    room: {
        type: ObjectId,
        ref: "Rooms"
    },
    interfaces: [{
        type: {
            type: String,
            required: true,
            enum: Object.keys(ENUM_SETTINGS)
        },
        adapter: {
            type: ObjectId,
            ref: "Adapters",
            //required: true
        },
        settings: {
            //...
        }
    }],
    meta: {
        manufacturer: {
            type: String
        },
        model: {
            type: String
        },
        web: {
            type: String
        },
        revision: {
            type: Number
        }
    }
});



// register model
mongoose.model("Devices", schema);