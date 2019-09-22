//import { IDocument } from "../../database/model.scenes";


const mongoose = require("mongoose");
const model = mongoose.model("Endpoints");


//@ts-ignore
module.exports = (stack) => {
    return new Promise((resolve, reject) => {

        //@ts-ignore
        const ids = stack.map(e => {
            return e.command;
        });

        //@ts-ignore
        model.find({ "commands._id": { $in: ids } }).exec((err, docs) => {

            if (err) {
                reject(err);
                return console.log(err);
            }

            // filter needed commands from multiple documents
            //@ts-ignore
            const commands = docs.map((arr) => {
                //@ts-ignore
                return arr.commands.filter((e) => {
                    return ids.indexOf(e._id.toString()) !== -1;
                });
            }).flat(2);


            // sort commands like the ids array
            //@ts-ignore
            commands.forEach((e, i, a) => {
                let to = ids.indexOf(e._id.toString());
                a.splice(to, 0, a.splice(i, 1)[0]);
            });

            // pass
            resolve(commands);

        });

    });
};