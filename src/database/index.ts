import * as mongoose from "mongoose";
const logger = require("../logger/index.js");
const log = logger.create("database");

// build uri with environment variables
const URI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=${process.env.DB_AUTH_SOURCE}`;

//NOTE set as options ?!
mongoose.set('useCreateIndex', true);

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    user: String(process.env.DB_AUTH_USER),
    pass: String(process.env.DB_AUTH_PASS),
    connectTimeoutMS: Number(process.env.DB_CONN_TIMEOUT)
});

mongoose.connection.on("open", () => {
    log.info("Connected to database %s", URI);
});

mongoose.connection.on("error", (err) => {
    log.error("Could not connect to database %s", URI);
    log.error(err, null);
    process.exit(1);
});


mongoose.plugin(function (
    schema: mongoose.Schema,
    options: Object
) {

    schema.add({
        timestamps: {
            created: {
                type: Number,
                default: Date.now()
            },
            modified: Number
        }
    });


    ["save", "updateOne"].forEach((k) => {
        schema.pre(k, function (next) {
            try {

                //@ts-ignore
                this.update({}, {
                    $set: {
                        "timestamps.modified": Date.now()
                    }
                });

                return next();

            } catch (e) {

                log.error(e, "Global plugin error %s", e.message);

            }
        });
    });


});




require("./model.users.js");
require("./model.tokens.js");
require("./model.devices.js");
require("./model.endpoints.js");
require("./model.rooms.js");
require("./model.adapter.js");
require("./model.scenes.js");