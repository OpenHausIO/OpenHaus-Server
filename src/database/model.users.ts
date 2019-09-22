import * as mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
//import { ObjectId } from "bson";

interface ISchema extends mongoose.Document {
    password: String
}

// create schema
const schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

schema.pre("save", function (next) {
    //@ts-ignore
    if (this.password) {

        //@ts-ignore
        bcrypt.hash(this.password, process.env.SALT_ROUNDS || 10, (err, hash) => {

            if (err) {
                return next(err);
            }

            //@ts-ignore
            this.password = hash;
            next();

        });

    } else {

        next();

    }
});

// register model
mongoose.model<ISchema>("Users", schema);