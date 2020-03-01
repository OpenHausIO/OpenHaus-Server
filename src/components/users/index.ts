import { EventEmitter } from "events";
import * as logger from "../../logger";
import * as mongoose from 'mongoose';
import { IUser } from '../../database/model.users';
import Hooks = require("../../system/hooks");

const model = mongoose.model("Users");

//@ts-ignore
const log = logger.create("users");
const events = new EventEmitter();

//@ts-ignore
const hooks = new Hooks();


const USERS = new Map(); // -> array ?!

//@ts-ignore
const COMPONENT = {
    ready: false,
    factory,
    hooks,
    events,
    // refresh method here ?!
    // würde sinn machen
    // siehe Object.assign
};


// add component methods
Object.assign(COMPONENT, {
    // init?!
});


// export component
module.exports = {
    USERS,
    //refresh, -> ist eigentlich nicht component typisch wie: ready, factory, hooks & events...
    __proto__: COMPONENT,
    prototype: COMPONENT
};




function factory() {

    log.warn("!!! TO IMPLEMENT !!!");

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

        COMPONENT.ready = true;
        events.emit("ready");

    });

}


factory();