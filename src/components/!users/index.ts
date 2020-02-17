import { EventEmitter } from "events";
import * as logger from "../../logger";
import * as mongoose from 'mongoose';
import { IUser } from '../../database/model.users';

const model = mongoose.model("Users");

//@ts-ignore
const log = logger.create("users");
const events = new EventEmitter();


const USERS = new Map();


module.exports = Object.assign(events, {
    isReady: false,
    factory,
    USERS
});


function UserComponent() {

};

//NOTE handle CRUD trough "rest-handler" ?!

UserComponent.prototype.add = function () {

};

UserComponent.prototype.update = function () {

};

UserComponent.prototype.remove = function () {

};

UserComponent.prototype.get = function () {

};


function factory() {

    USERS.clear();


    model.find({}).lean().exec((err, docs) => {

        if (err) {
            log.error(err, "Could not fetch users form database");
            process.exit();
        }

        // feedback
        log.debug("%d users from database fetched", docs.length);


        docs.forEach((user: IUser) => {
            USERS.set(String(user._id), user);
        });

        module.exports.isReady = true;
        events.emit("ready");

    });


    //@ts-ignore
    module.exports.instance = new UserComponent();


}


factory();