import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface IRoom extends mongoose.Document {
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
        default: "fas fa-door-open"
    },
    floor: {
        type: Number
    },
    number: {
        type: Number,
        //required: true
    },/*
    occupied: {
        type: Boolean,
        default: false
    },*/
    enabled: {
        type: Boolean,
        default: true
    }
});


// register model
mongoose.model("Rooms", schema);