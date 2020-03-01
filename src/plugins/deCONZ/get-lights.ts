import request = require("../../system/requests");
import C_ENDPOINTS = require("../../components/endpoints");

// https://dresden-elektronik.github.io/deconz-rest-doc/
// https://dresden-elektronik.github.io/deconz-rest-doc/websocket/

const API_KEY = process.env.API_KEY || "0AF12B2A73";
const API_URL = `http://192.168.2.4/api/${API_KEY}`;


module.exports = (log, events) => {


    function fetchLights() {

        //@ts-ignore
        request.request(`${API_URL}/lights`, (err, head, body) => {

            if (err) {
                log.error(err, "Could not fetch lights from gateway")
                return;
            }

            let json = JSON.parse(body);
            let lights = Object.keys(json);
            let counter = lights.length;

            //@ts-ignore
            let deviceEndpoints = C_ENDPOINTS.ENDPOINTS.filter((e) => {
                return String(e.device) == "5e53c9326f104513cc63a489"; // device id
            });

            // deviceEndpoints are fewier
            // lights are all from gateway


            if (lights.length > deviceEndpoints.length) {

                // feedback
                log.debug("Refresh endpoints");

                let endpoints = [];


                const endpointsAdded = new Promise((resolve, reject) => {

                    // filter light we need to add
                    // compare device endpoints with light endpoints
                    let endpoitsToAdd = lights.filter((id) => {

                        // when id not in deviceEndpoints add

                        let result = deviceEndpoints.find((endpoint) => {
                            return endpoint.identifier == id;
                        });

                        if (result) {
                            // if found, not add
                            return false;
                        } else {
                            // if not found, add
                            return true;
                        }

                    });



                    endpoitsToAdd.forEach((k) => {

                        // feedback
                        log.debug("Add light %d to databse", k);

                        let lamp = json[k];

                        //@ts-ignore
                        C_ENDPOINTS.add({
                            name: lamp.name,
                            device: "5e53c9326f104513cc63a489",
                            identifier: k,
                            commands: [{
                                name: "An",
                                interface: "5e53c9326f104513cc63a489"
                            }, {
                                name: "Aus",
                                interface: "5e53c9326f104513cc63a489"
                            }]
                        }, (err, doc) => {
                            if (err) {

                                log.error("Could not add endpoint");
                                reject(err);

                            } else {

                                log.verbose("Endpoint '%s' added", doc.name);
                                endpoints.push(doc);

                                counter--;

                                if (counter === 0) {
                                    log.debug("Endpoints added to databases");
                                    resolve(endpoints);
                                }

                            }
                        });

                    });


                });

                endpointsAdded.then((list: Array<any>) => {

                    log.info("%d endpoints added", list.length);
                    events.emit("endpoints.added", list);

                }).catch((err) => {

                    // feedback
                    log.error(err, "Could not add endpoints: %s", err.message);

                });

            }

        });
    }



    //@ts-ignore
    if (C_ENDPOINTS.ready) {
        fetchLights();
    } else {
        //@ts-ignore
        C_ENDPOINTS.events.on("ready", () => {
            fetchLights();
        });
    }


};