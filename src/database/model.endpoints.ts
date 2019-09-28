import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface ICommand {
    _id: ObjectId,
    name: String,
    payload: any,
    params: Object,
    interface: ObjectId
}


export interface IEndpoints {
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
            enum: ["number", "string", "boolean"],
            required: true,
        },
        // keys below are Joi functions
        // values paramter for functions
        // https://hapi.dev/family/joi/?v=16.1.4#introduction
        min: Number,
        max: Number,
        default: { type: mongoose.Schema.Types.Mixed },
        pattern: mongoose.Schema.Types.Mixed,
    }
});


const commandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    }
});


// register model
mongoose.model("Endpoints", schema);