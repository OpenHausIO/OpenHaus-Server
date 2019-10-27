import * as mongoose from "mongoose";
const logger = require("../logger/index.js");

mongoose.set('useCreateIndex', true);

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    user: process.env.DB_AUTH_USER,
    pass: process.env.DB_AUTH_PASS
});


mongoose.connection.on("error", (err) => {
    logger.error(err, "Could not connect to database %s");
    process.exit(1);
});


require("./model.users.js");
require("./model.tokens.js");
require("./model.devices.js");
require("./model.endpoints.js");
require("./model.rooms.js");
require("./model.adapter.js");
require("./model.scenes.js");