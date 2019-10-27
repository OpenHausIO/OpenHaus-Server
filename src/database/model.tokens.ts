import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface IToken extends mongoose.Document {
    _id: ObjectId,
    token: String,
    user: ObjectId
}


// create schema
const schema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: ObjectId,
        ref: "users",
        required: true
    }
    /*
    // enabled/disable token
    enabled: {
        type: Boolean,
        default: true
    }*/
});



// register model
mongoose.model("Tokens", schema);