import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


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
            enum: ["number", "string", "boolean", "binary"],
            required: true,
        },
        // NOTE noch mal checken was default & pattern machen
        // keys below are Joi functions
        // values parameter for functions
        // https://hapi.dev/family/joi/?v=16.1.4#introduction
        min: Number,
        max: Number,
        default: { type: mongoose.Schema.Types.Mixed },
        pattern: { type: mongoose.Schema.Types.Mixed },
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
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    params: {
        type: [paramsSchema],
        default: []
    }
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
        required: true,
        ref: "Rooms"
    },
    commands: {
        type: [commandSchema],
        //required: true
    },
    enabled: {
        type: Boolean,
        default: true
    }
});


// register model
mongoose.model("Endpoints", schema);