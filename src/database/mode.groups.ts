import * as mongoose from "mongoose";

//NOTE: group, cathegory, users ?!?!?!??!?!?!?!??!!
//TODO: decide what we do with groups!

// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});



// register model
mongoose.model("Groups", schema);