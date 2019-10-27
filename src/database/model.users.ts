import * as mongoose from "mongoose";
import { ObjectId } from 'bson';
import * as bcrypt from "bcrypt";

export interface IUser extends mongoose.Document {
    _id: ObjectId,
    name: String,
    email: String,
    enabled: Boolean
}


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    }
});


schema.pre("save", function (next) {

    //@ts-ignore
    if (this.password) {
        //@ts-ignore
        bcrypt.hash(this.password, process.env.BCRYPT_SALT_ROUNDS, (err, hash) => {

            if (err) {
                //NOTE add logger ?
                return next(err);
            }

            //@ts-ignore
            this.password = hash;
            next();

        });
    }

    //@ts-ignore
    if (!this.enabled) {
        //TODO remove tokens?!
        // is user is disabled
        // why should he have active logins ?!
    }

});

schema.pre("find", function () {
    this.select("-password");
});


// register model
mongoose.model("Users", schema);