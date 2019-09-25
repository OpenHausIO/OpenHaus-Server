import * as mongoose from "mongoose";
import { ObjectID } from "bson";
const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IStack {
    command: ObjectID,
    params: Object,
    makro: Object
}

export interface IDocument extends mongoose.MongooseDocument {
    name: String,
    banks: Array<IStack>
}


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    banks: [
        [{
            "command": ObjectId,
            "params": Object,
            "makro": Object
        }]
    ]
});


// register model
mongoose.model("Scenes", schema);