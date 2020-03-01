// set default max event listeners number
// usefull if you have many plugins installed
require("events").EventEmitter.defaultMaxListeners = Number(process.env.MAX_EVENT_LISTENERS);