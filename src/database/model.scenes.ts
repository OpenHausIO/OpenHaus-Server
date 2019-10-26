import * as mongoose from "mongoose";
import { ObjectID } from "bson";
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IStack {
    command: ObjectID,
    makro: Object,
    settings: {
        cache: {
            enabled: Boolean,
            livetime: Number
        }
    }
}

export interface IDocument extends mongoose.MongooseDocument {
    name: String,
    banks: Array<IStack>
}

const bankSchema = [{
    "command": ObjectId,
    "makro": Object
}];

// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    banks: {
        type: [bankSchema],
        //default: []
    },
    settings: {
        cache: {
            type: Object,
            enabled: {
                type: Boolean,
                default: true
            },
            livetime: {
                type: Number,
                default: (1000 * 60) * 60 * 24 * 7 // 1 week (604800000)
            }
        }
    }
});


// register model
mongoose.model("Scenes", schema);