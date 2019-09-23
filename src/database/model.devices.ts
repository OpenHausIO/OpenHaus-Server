import * as mongoose from "mongoose";
import { ObjectId } from 'bson';
import * as Joi from "joi";


// https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722
// https://stackoverflow.com/questions/28166463/how-to-create-mongoose-schema-dynamically
// https://stackoverflow.com/questions/15012250/handling-mongoose-validation-errors-where-and-how
// https://stackoverflow.com/a/17024166/5781499


enum InterfaceTypes {
    "RS232",
    "ETHERNET"
}


export interface IInterfaces {
    _id: ObjectId,
    type: InterfaceTypes,
    description: String,
    adapter: ObjectId,
    settings: Object
}

export interface IDevices {
    _id: ObjectId,
    name: String,
    icon: String,
    room?: ObjectId,
    adapter?: ObjectId,
    meta?: {
        manufacturer?: String,
        model?: String,
        web?: String,
        revision?: Number
    },
    interfaces: Array<IInterfaces>
}


const ENUM_SETTINGS = {
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
        path: Joi.string().default("/"),
        protocol: Joi.string().required().valid(["ws", "http", "tcp", "udp"])
    })
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
        type: ObjectId,
        ref: "Adapters",
        //required: true
        // NOTE:
        // if no adapter set, use vanilla EventEmitter: 
        // created for adapter -> refactor ?
    },
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
                    const result = ENUM_SETTINGS[this.type].validate(v);

                    result.then(() => {
                        this.settings = result.value;
                    });

                    return result;

                } catch (e) {
                    return false;
                }

            }
        }
    }
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
        type: ObjectId,
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
    if (!this.interfaces || this.interfaces.length <= 0) {
        return next(new Error("INTERFACE_INVALID"));
    }

    next();

});


// register model
mongoose.model("Devices", schema);