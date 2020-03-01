//import path = require("path");
import { EventEmitter } from "events";
//@ts-ignore
import logger = require("../../logger"); //`${__dirname}/../../logger/index.js`
import Hooks = require("../../system/hooks");

/**
 * @module devices
 * @namespace devices
 */


//@ts-ignore
const log = logger.create("scenes");
const events = new EventEmitter();
//@ts-ignore
const hooks = new Hooks();
//const init = false;



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
    __proto__: COMPONENT,
    prototype: COMPONENT
};



/**
 * Component factory
 */
function factory() {

    log.warn("!!! TO IMPLEMENT !!!");

    // feedback
    log.debug("factory called");

    process.nextTick(() => {
        COMPONENT.ready = true;
        events.emit("ready");
    });

}

/*
if (process.env.IGNORE_COMPONENTS.split(",").includes("devices")) {

    // feedback
    log.warn("Component ignored");

} else {

    // init
    factory();

}
*/

factory();