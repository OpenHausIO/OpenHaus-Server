import * as mongoose from "mongoose";



// create schema
const schema = new mongoose.Schema({
    label: String,
    level: Number,
    message: String,
    timestamp: Date
});



// register model
mongoose.model("Logfiles", schema);