import * as mongoose from "mongoose";

const model = mongoose.model("Endpoints");

//@ts-ignore
module.exports = (stack) => {
    return new Promise((resolve, reject) => {

        //@ts-ignore
        var order = [];

        model.find({
            commands: {
                $elemMatch: {
                    _id: {
                        //@ts-ignore
                        $in: stack.map(e => {
                            return e.command;
                        })
                    }
                }
            }
        }).lean().exec((err, docs) => {

            if (err) {
                return reject(err);
            }

            // list = array of all endpoint comands 
            // thats are used in this stack
            //@ts-ignore
            const list = docs.reduce((prev, curr) => {
                return prev.concat(curr.commands);
            }, []);


            //@ts-ignore
            stack.forEach((e) => {
                if (e.command) {

                    //@ts-ignore
                    const cmd = list.find((cmd) => {
                        return e.command == cmd._id.toString();
                    });

                    order.push(cmd);

                } else if (e.makro) {
                    order.push(e);
                } else {
                    // hmm....
                }
            });


            //@ts-ignore
            resolve(order);


        });


    });
}