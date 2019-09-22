
// https://stackoverflow.com/questions/30853265/dynamic-chaining-in-javascript-promises


const makros = require("./makros.js");
const { adapter } = require("../../routes/states.js");


//@ts-ignore
module.exports = function (scene) {

    //@ts-ignore
    const stack = [];
    var stopChain = false;

    //@ts-ignore
    scene.forEach((action, index) => {
        if (action.makro && makros.hasOwnProperty(action.makro)) {

            stack.push(makros[action.makro](action.options, action.command));

        } else if (!action.makro) {

            //@ts-ignore
            stack.push(function (result) {
                return new Promise((resolve, reject) => {
                    //setTimeout(() => {

                    if (stopChain) {
                        console.log("Chain stopped at", index)
                        return reject();
                    }


                    //@ts-ignore
                    if (adapter.has(action.interface)) {

                        //@ts-ignore
                        const adapt = adapter.get(action.interface);
                        adapt.iface.emit("command", action, action.params);

                        console.log("%s | Aktion %s done", index, action.name);
                        resolve();

                    } else {

                        console.log("IFACE_NOT_CONNECTED")

                    }

                    //}, 1000);
                });
            });

        } else {

            // unknown action
            console.log("Unknown action", action)

        }
    });


    //@ts-ignore
    return stack.reduce((prev, curr) => {
        return prev.then(curr);
    }, Promise.resolve());


};