import * as mongoose from "mongoose";
import logger = require("../logger");
//@ts-ignore
const log = logger.create("database");

// build uri with environment variables
const URI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=${process.env.DB_AUTH_SOURCE}`;


mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
    user: String(process.env.DB_AUTH_USER),
    pass: String(process.env.DB_AUTH_PASS),
    connectTimeoutMS: Number(process.env.DB_CONN_TIMEOUT)
});

mongoose.connection.on("open", () => {
    //@ts-ignore
    mongoose.connected = true;
    log.info("Connected to database %s", URI);
});

mongoose.connection.on("error", (err) => {
    log.error("Could not connect to database %s", URI);
    log.error(err, null);
    process.exit(1);
});


/*
// problem mit irgnedwas kann nicht gesetzt werden
// glaube auf nested schema
mongoose.plugin(function (
    schema: mongoose.Schema,
    options: Object
) {

    schema.add({
        timestamps: {
            created: {
                type: Number, //NOTE right type ?!
                default: Date.now()
            },
            modified: Number
        }
    });


    ["save", "updateOne"].forEach((k) => {
        schema.pre(k, function (next) {
            try {

                // feedback
                log.verbose("Timestamp update on hook '%s'", k);

                //@ts-ignore
                this.update({}, {
                    $set: {
                        "timestamps.modified": Date.now()
                    }
                });

                //NOTE return neede?!
                return next();

            } catch (e) {

                log.error(e, "Global plugin error %s", e.message);

            }
        });
    });


});
*/



require("./model.users");
//require("./model.tokens");
require("./model.devices");
require("./model.endpoints");
require("./model.rooms");
require("./model.adapter");
//require("./model.scenes");
//require("./model.plugins");
//require("./model.credentials");
//require("./model.logfiles");

module.exports = mongoose.connection;