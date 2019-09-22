import * as mongoose from "mongoose";


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