import * as mongoose from "mongoose";
import { ObjectId } from 'bson';


export interface IPlugin extends mongoose.Document {
    _id: ObjectId,
    name: String,
    alias: String,
    meta: {
        author: String,
        version: Number
    },
    timestamps: {
        created: Date,
        updated?: Date,
        installed: Date
    },
    enabled: Boolean
}


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    alias: {
        type: String // folder name in .../plugins/<alias>
    },
    meta: {
        author: {
            type: String,
            //required: true
        },
        version: {
            type: Number,
            //required: true
        }
    },
    enabled: {
        type: Boolean,
        default: true
    },
    timestamps: {
        created: {
            type: Date,
            default: Date.now()
        },
        updated: {
            type: Date
        },
        installed: {
            type: Date
        }
    }
});



// register model
mongoose.model("Plugins", schema);