//@ts-ignore
import Middleware = require("../middleware");

/**
 * @constructor
 */
function Hooks(options) {

    this.middleware = new Map();

    this.options = Object.assign({
        prePost: false
    }, options);

    //@ts-ignore
    //this.pre = new Hooks();
    //@ts-ignore
    //this.post = new Hooks();
};


/**
 * 
 */
Hooks.prototype.trigger = function (event: String, ...args: Array<any>) {


    if (!this.middleware.has(event)) {
        // create new Middleware, no `use` called
        //@ts-ignore
        this.middleware.set(event, new Middleware());
    }

    let middleware = this.middleware.get(event);
    //middleware.start.apply(middleware, args);

    // NOTE change ...args to args ?!
    process.nextTick(middleware.start.bind(middleware), ...args);




    /*    
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
    */

};


/**
 * 
 */
Hooks.prototype.intercept = function (event: String, cb: Function) {

    if (!this.middleware.has(event)) {
        //@ts-ignore
        this.middleware.set(event, new Middleware());
    }

    let middleware = this.middleware.get(event);
    middleware.use.call(middleware, cb);

};



// pre/post register intercept handler
// trigger calls pre stack first
// after pre stack call function
// after function finish call post stack


module.exports = Hooks;
//export default Hooks;