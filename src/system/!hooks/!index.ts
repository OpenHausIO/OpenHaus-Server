//@ts-ignore
import Middleware = require("../!middleware");

function Hooks() {
    this.middleware = new Map();
};


Hooks.prototype.emit = function (event: String, ...args: Array<any>) {
    if (this.middleware.has(event)) {

        let middleware = this.middleware.get(event);
        //middleware.start.apply(middleware, args);

        process.nextTick(middleware.start.bind(middleware), ...args);


    } else {

        // create new Middleware, no `use` called
        this.middleware.set(event, new Middleware());
        let middleware = this.middleware.get(event);
        //middleware.start.apply(middleware, args);

        process.nextTick(middleware.start.bind(middleware), ...args);

    }
};


Hooks.prototype.on = function (event: String, cb: Function) {

    if (!this.middleware.has(event)) {
        this.middleware.set(event, new Middleware());
    }

    let middleware = this.middleware.get(event);
    middleware.use.call(middleware, cb);

};


module.exports = Hooks;