import winston = require("winston");
//import component = require("../../components/devices");

module.exports = (log: winston.Logger) => {

    // feedback
    log.info("Plugin init");

    /*

    //@ts-ignore
    component.events.on("refreshed", () => {
        //@ts-ignore
        console.log(component.DEVICES);
    });



    //@ts-ignore
    component.hooks.on("enable", (id, next) => {
        console.log("enable %s hook called", id);
        //setTimeout(next, 1000);
        next();
    });

    //@ts-ignore
    component.hooks.on("enabled", (id, ok, next) => {
        console.log("enabled %s hook called, result: %j", id, ok);
        //component.refresh(next);
        next();
    });



    //@ts-ignore
    component.hooks.on("disable", (id, next) => {
        console.log("disable %s hook called", id);
        //setTimeout(next, 1000);
        next();
    });

    //@ts-ignore
    component.hooks.on("disabled", (id, ok, next) => {
        console.log("disabled %s hook called, result: %j", id, ok);
        //component.refresh(next);
        next();
    });






    function doit(method = "enable") {

        //@ts-ignore
        let ids = component.DEVICES.map((device) => {
            return device._id;
        });

        // cb counter
        let i = ids.length;

        // disable all devices
        ids.forEach((id) => {

            // feedback
            console.log("disable device: %s", id);

            // dynamic api called!
            component[method](id, (err, res) => {

                // feedback
                console.log("Device (%s) tree updated!", id, err, res);

                i--;

                if (i === 0) {
                    //console.log(ids.length);
                    //@ts-ignore
                    component.refresh(() => {
                        console.log("refreshed!");
                    });
                }

            });

        });

    }



    //@ts-ignore
    if (!component.ready) {
        //@ts-ignore
        component.events.on("ready", doit);
    } else {
        doit();
    }

    */

};