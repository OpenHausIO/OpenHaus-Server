import * as mongoose from "mongoose";

mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://127.0.0.1/OpenHaus", {
    useNewUrlParser: true,
    //createIndexes: true
});


require("./model.devices.js");
require("./model.endpoints.js");
require("./model.rooms.js");
require("./model.users.js");
require("./model.adapter.js");
require("./model.scenes.js");