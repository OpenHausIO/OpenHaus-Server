function Middleware() {
    this.args = [];
};


Middleware.prototype.use = function (fn: Function) {
    this.go = ((stack) => {
        return (next: Function) => {

            stack.call(this, () => {
                fn.apply(this, [...this.args, next.bind(this)]);
            });

        };
    })(this.go);
};


Middleware.prototype.go = function (next: Function) {
    next();
};


Middleware.prototype.start = function (...args: Array<any>) {

    const final = args.pop();
    this.args = args;

    this.go(() => {
        final.apply(this, args);
    });

};


module.exports = Middleware;
export default Middleware;