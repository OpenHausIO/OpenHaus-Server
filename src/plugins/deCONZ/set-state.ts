import request = require("../../system/requests");

const API_KEY = process.env.API_KEY || "0AF12B2A73";
const API_URL = `http://192.168.2.4/api/${API_KEY}`;


module.exports = (log, events) => {

    events.on("lights.set", (id, data) => {

        const options = Object.assign({
            method: "PUT",
            data: JSON.stringify(data)
        });

        //@ts-ignore
        request.request(`${API_URL}/lights/${id}/state`, options, (err, info, body) => {

            if (err) {
                log.error(err, "Could not make request to set light state: %s", err.message);
                return;
            }

            if (info.status !== 200) {
                log.warn("Could not set light '%s' state", id);
            }

            if (info.status === 200) {
                log.debug("Set light '%s' state", id);
            }

            //console.log(info.status, body);

        });

    });

};