import * as mongoose from "mongoose";
import { ObjectId } from 'bson';

// TODO add custom fields ?!
// add custom fields for varius reasons:
// - plugins identification
// https://github.com/hnryjms/mongoose-custom-fields

export interface ICommand {
    _id: ObjectId,
    name: String,
    payload: any,
    params: Object, // -> should array ?!
    interface: ObjectId
}


export interface IEndpoint extends mongoose.Document {
    _id: ObjectId,
    name: String,
    icon: String,
    commands: Array<ICommand>
    room: ObjectId,
}


const paramsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: {
            type: String,
            // TODO see below
            // template used in commander
            // payload used for raw sending
            // check/improve boolean type!!!!
            enum: ["number", "string", "boolean", "binary"], // NOTE: remove binary (boolean?) -> see ..template TODO
            required: true,
        },
        // NOTE noch mal checken was default & pattern machen
        // keys below are Joi functions
        // values parameter for functions
        // https://hapi.dev/family/joi/?v=16.1.4#introduction
        min: Number,
        max: Number,
        default: { type: mongoose.Schema.Types.Mixed },
        pattern: { type: mongoose.Schema.Types.Mixed }, // NOTE: gut wofür ?
    }
});


const commandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // NOTE enabled notwendig ?!
    enabled: {
        type: Boolean,
        default: true
    },
    interface: {
        type: ObjectId,
        required: true
    },
    template: {
        // TODO see below
        // template gets compiled with params
        // change template to type string?!(!!)
        // template can be binary too!
        type: mongoose.Schema.Types.Mixed,
        //required: true
    },
    payload: {
        // payload is untouched sended to the interface
        // perfect for binaray data
        type: mongoose.Schema.Types.Mixed,
        //required: true
    },
    params: {
        type: [paramsSchema],
        default: []
    }
    // TODO add custom/identifier for plugins?
    // TODO add state as virtual field for on/off, open/close state?
});


// create schema
const schema = new mongoose.Schema({
    name: {
        // human readable name should,
        // be displayed in the frontend
        type: String,
        required: true
    },
    icon: { // -> meta ?
        type: String,
        //required: true
    },
    device: {
        type: ObjectId,
        required: true,
        ref: "Devices"
    },
    room: {
        type: ObjectId,
        //required: true,
        ref: "Rooms"
    },
    commands: {
        type: [commandSchema],
        //required: true
    },
    identifier: {
        // this should be used by plugins
        // example: rest api returns a id
        // the plugins use the id to make
        // http requests to the api
        type: mongoose.Schema.Types.Mixed
    },
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
            type: String
        },
        /*
        // ??????
        icon: {
            type: String
        }
        */
    },
    enabled: {
        type: Boolean,
        default: true
    },
    hidden: {
        type: Boolean,
        defualt: false
    }
});


// register model
mongoose.model("Endpoints", schema);