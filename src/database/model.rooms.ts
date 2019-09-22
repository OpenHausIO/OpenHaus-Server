import * as mongoose from "mongoose";


// create schema
const schema = new mongoose.Schema({
    name: {
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