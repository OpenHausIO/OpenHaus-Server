import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface ICredentials extends mongoose.Document {
    _id: ObjectId
}


// create schema
const schema = new mongoose.Schema({
    username: {
        type: Buffer
    },
    password: {
        type: Buffer
    },
    email: {
        type: Buffer
    },
    service: {
        type: Array,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    }
});



// register model
mongoose.model("Credentials", schema);