"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bson_1 = require("bson");
// https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
// https://stackoverflow.com/questions/28166463/how-to-create-mongoose-schema-dynamically
// https://stackoverflow.com/questions/15012250/handling-mongoose-validation-errors-where-and-how
// https://stackoverflow.com/a/17024166/5781499
var InterfaceTypes;
(function (InterfaceTypes) {
    InterfaceTypes[InterfaceTypes["RS232"] = 0] = "RS232";
    InterfaceTypes[InterfaceTypes["ETHERNET"] = 1] = "ETHERNET";
})(InterfaceTypes || (InterfaceTypes = {}));
/**
 * enum_settings = schema
 * - add schema over schema.add(settings, ....)?!
 * - monkey patching ?!
 */
const ENUM_SETTINGS = {
    "RS232": {
        baudRate: {
            type: Number,
            required: true
        },
        dataBits: {
            type: Number,
            default: 8
        },
        stopBits: {
            type: Number,
            default: 1
        },
        parity: {
            type: String,
            enum: ['none', 'even', 'mark', 'odd', 'space'],
            default: "none"
        },
        rtscts: {
            type: Boolean,
            default: false
        },
        xon: {
            type: Boolean,
            default: false
        },
        xoff: {
            type: Boolean,
            default: false
        },
        xany: {
            type: Boolean,
            default: false
        }
    },
    "ETHERNET": {
        host: {
            type: String,
            required: true
        },
        port: {
            type: Number,
            required: true
        },
        path: {
            type: String,
            default: "/"
        },
        protocol: {
            type: String,
            required: true,
            enum: ["ws", "http", "tcp", "udp"]
        }
    }
};
const interfaceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: Object.keys(ENUM_SETTINGS)
    },
    description: {
        type: String
    },
    adapter: {
        type: bson_1.ObjectId,
        ref: "Adapters",
    },
    settings: {
        type: Object,
        required: true
    }
}, {
    strict: false
});
// create schema
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    room: {
        type: bson_1.ObjectId,
        ref: "Rooms"
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
    if (this.interfaces && this.interfaces.length > 0) {
        //@ts-ignore
        this.interfaces = this.interfaces.map(e => {
            if (ENUM_SETTINGS.hasOwnProperty(e.type)) {
                //@ts-ignore
                const settings = ENUM_SETTINGS[e.type];
                for (let key in settings) {
                    // validate required 
                    if (settings[key].required) {
                        if (!e.settings[key]) {
                            next(new Error(`Path 'settings.${key}' is required!`));
                        }
                        if (typeof (e.settings[key]) != settings[key].type.name.toLowerCase()) {
                            next(new Error(`Path 'settings.${key}' invalide type!`));
                        }
                    }
                    // validate enum
                    if (settings[key].type === String && settings[key].enum) {
                        if (settings[key].enum.indexOf(e.settings[key]) === -1) {
                            next(new Error(`Path settings.${key} '${e.settings[key]}' not valid use: [${settings[key].enum}]`));
                        }
                    }
                    // set default value
                    if (settings[key].default) {
                        e.settings[key] = settings[key].default;
                    }
                }
            }
            return e;
        });
        next();
    }
    else {
        return next(new Error("INTERFACES_NOT_SET"));
    }
});
// register model
mongoose.model("Devices", schema);
