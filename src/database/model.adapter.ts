import * as mongoose from "mongoose";


export interface Adapters {
    name: String,
    descprition: String,
    version: Number,
    author: String,
    folder: String
}


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    author: {
        type: String,
        requried: true
    },
    folder: {
        type: String,
        required: true,
        unique: true
    }
});


// register model
mongoose.model("Adapters", schema);