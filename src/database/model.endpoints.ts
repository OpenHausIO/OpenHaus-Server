import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface ICommand {
    _id: ObjectId,
    name: String,
    params: Object
}


export interface IEndpoints {
    _id: ObjectId,
    name: String,
    icon: String,
    commands: Array<ICommand>
    interface: ObjectId,
    room: ObjectId,
}


const commandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    interface: {
        type: ObjectId,
        required: true
    },
    raw: mongoose.Schema.Types.Mixed
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