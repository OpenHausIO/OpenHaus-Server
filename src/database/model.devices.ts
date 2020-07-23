import * as mongoose from "mongoose";
import { ObjectId } from 'bson';
import * as Joi from "joi";

//const log = require("../logger/index.js");

// https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
// https://stackoverflow.com/questions/28166463/how-to-create-mongoose-schema-dynamically
// https://stackoverflow.com/questions/15012250/handling-mongoose-validation-errors-where-and-how
// https://stackoverflow.com/a/17024166/5781499

const REGEX_MAC_ADRESS = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;


enum InterfaceTypes {
    "RS232",
    "ETHERNET"
}


export interface IInterface {
    _id: ObjectId,
    type: InterfaceTypes,
    description: String,
    adapter: ObjectId,
    settings: Object,
    mode: String
}

export interface IDevice extends mongoose.Document {
    _id: ObjectId,
    name: String,
    icon: String,
    room?: ObjectId,
    adapter?: ObjectId,
    enabled: Boolean,
    meta?: {
        manufacturer?: String,
        model?: String,
        web?: String,
        revision?: Number
    },
    interfaces: Array<IInterface>
}


const ENUM_SETTINGS_TYPE = {
    "RS232": Joi.object({
        baudRate: Joi.number().required(),
        dataBits: Joi.number().default(8),
        stopBits: Joi.number().default(1),
        parity: Joi.string().valid(["none", "even", "mark", "odd", "space"]).default("none"),
        rtscts: Joi.boolean().default(false),
        xon: Joi.boolean().default(false),
        xoff: Joi.boolean().default(false),
        xany: Joi.boolean().default(false)
    }),
    "ETHERNET": Joi.object({
        host: Joi.string().required(),
        port: Joi.number().required(),
        mac: Joi.string().regex(REGEX_MAC_ADRESS),
        /*transport: {
            protocol: Joi.string().required().valid(["tcp", "udp"]),
            port: Joi.number().required(), // -> add transport settings
            mode: Joi.string().valid(["client", "server"]).default("client"),
            broadcast: Joi.boolean().default(false)
        },*/
        // remove everything below this line
        // these are handled by plugins
        path: Joi.string().default("/"), // remove ?! plugin handle REST apis -> todo
        protocol: Joi.string().required().valid([
            "ws", "wss",
            "http", "https",
            "tcp", // rtsp ?!
            "udp" // ssdp ?!
        ]),
        mode: Joi.string().valid(["client", "server"]).default("client"), // -> remove -> transport        
    })
};


const interfaceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: Object.keys(ENUM_SETTINGS_TYPE)
    },
    description: {
        type: String
    },
    adapter: {
        type: ObjectId,
        ref: "Adapters",
        required: true
        // NOTE:
        // if no adapter set, use vanilla EventEmitter: 
        // created for adapter -> refactor ?
        // use adapter "raw" -> plain tcp/udp/ws from connector
    },
    // add property object for 
    // mac / IR type: philips,nec / toslink, PCM ?!
    settings: {
        type: Object,
        required: true,
        validate: {
            validator: function (v: Object) {

                if (!this.type || !v) {
                    return false;
                }

                try {

                    // get joi validator
                    //@ts-ignore
                    const result = ENUM_SETTINGS_TYPE[this.type].validate(v);

                    result.then(() => {
                        this.settings = result.value;
                    });

                    return result;

                } catch (e) {
                    //log.warn(e, "Could not validate inteface settings!");
                    return false;
                }

            }
        }
    },
    options: {
        type: Object
    }
});


// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    identifier: {
        type: mongoose.Schema.Types.Mixed
    },
    icon: {
        //NOTE needed?!
        type: String,
        default: "far fa-question-circle"
    },
    room: {
        type: ObjectId,
        ref: "Rooms"
    },
    enabled: {
        type: Boolean,
        default: true
    },
    interfaces: {
        type: [interfaceSchema],
        required: true,
    },
    meta: {
        manufacturer: {
            type: String
        },
        model: {
            type: String
        },
        web: {
            type: String
        },
        revision: {
            type: Number
        }
    }
});

schema.pre("validate", function (next) {

    //@ts-ignore
    if (!this.interfaces || this.interfaces.length <= 0) {
        return next(new Error("INTERFACE_VALIDATION"));
    }

    next();

});


// register model
mongoose.model("Devices", schema);