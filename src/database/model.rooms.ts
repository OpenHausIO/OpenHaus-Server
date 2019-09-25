import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface IRooms {
    _id: ObjectId,
    name: String,
    icon: String,
    floor: Number,
    number: Number
}


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
    floor: {
        type: Number,
        required: true
    },
    number: {
        type: Number,
        //required: true
    }
});


// register model
mongoose.model("Rooms", schema);