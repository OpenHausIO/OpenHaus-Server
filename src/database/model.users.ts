import * as mongoose from "mongoose";
import { ObjectId } from 'bson';
import * as bcrypt from "bcrypt";

export interface IUser extends mongoose.Document {
    _id: ObjectId,
    name: String,
    email: String,
    enabled: Boolean,
    //password: String
};


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        //unique: true
    },
    password: {
        type: String,
        required: true
    },
    /*confirmed: {
        type: Boolean,
        value: false,
        default: false
    },*/
    enabled: {
        type: Boolean,
        default: false
    }
});


schema.pre("save", function (next) {

    const passwordHash = new Promise((resolve, reject) => {
        //@ts-ignore
        if (this.password) {
            //@ts-ignore
            bcrypt.hash(this.password, process.env.BCRYPT_SALT_ROUNDS, (err, hash) => {

                if (err) {
                    //NOTE add logger ?
                    console.log(err, "Could not hash user password");
                    return reject(err);
                }

                //console.log("User password hashed!", hash);

                //@ts-ignore
                this.password = hash;
                resolve();

            });
        } else {
            resolve();
        }
    });


    const enabledCheck = new Promise((resolve, reject) => {
        //@ts-ignore
        if (this.enabled) {
            //TODO remove tokens?!
            // is user is disabled
            // why should he have active logins ?!
            resolve();
        } else {
            resolve();
        }
    });


    Promise.all([
        passwordHash,
        enabledCheck
    ]).then(() => {

        //console.log("All user stuff pre things");
        next();

    }).catch((err) => {

        //console.log("Error on asdf", err);
        next(err);

    });



    // fix for account creation
    // - remove password from response after save/put
    // TODO not working! -> if removed 
    //@ts-ignore
    //delete this.password;

});



["find", "findOne"].forEach((k) => {
    schema.pre(k, function () {
        //@ts-ignore
        this.select("-password");
    });
})



// register model
mongoose.model("Users", schema);