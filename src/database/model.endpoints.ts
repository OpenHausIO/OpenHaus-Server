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
        //TODO Try this shit at home
        // settings: ENUM_SETTINGS[this.type]
        type: mongoose.Schema.Types.Mixed, //Range
        // min: 0,
        // max: 100
        required: true
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
    payload: mongoose.Schema.Types.Mixed,
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