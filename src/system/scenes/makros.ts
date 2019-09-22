//@ts-ignore
const repeat = function (args, command) {
    return function () {

        const opts = Object.assign({
            interval: 100,
            rounds: 4
        }, args);

        let counter = 0;

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {

                if (counter < opts.rounds) {

                    // feedback
                    console.log("Repeat Command %s", command.command)

                }

                // increment
                counter++;

                if (counter === opts.rounds) {
                    clearInterval(interval);
                    resolve();
                }

            }, opts.interval);
        });

    };
};

//@ts-ignore
const sleep = function (args) {
    return function () {

        const opts = Object.assign({
            ms: 1000,
        }, args);

        return new Promise((resolve, reject) => {
            setTimeout(resolve, opts.ms);
        });

    }
};


module.exports = {
    sleep,
    repeat
};