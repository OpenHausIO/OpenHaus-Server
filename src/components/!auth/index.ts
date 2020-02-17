import * as fs from "fs";
import { execSync } from 'child_process';
import * as logger from "../../logger/index.js";
//@ts-ignore
const log = logger.create("devices");


//TODO should we only check when the api is protected ?
//NOTE API is always protected ?! -> process.env.API_PROTECTED
// check if we have a keypair for signing JWT tokens
fs.access(`${__dirname}/private-key.pem`, fs.constants.F_OK, (err) => {
    if (err) {
        if (err.code === "ENOENT") {
            try {

                log.info("Create public/private key-pair...");

                execSync(`openssl genpkey -algorithm RSA -out ./private-key.pem -pkeyopt rsa_keygen_bits:${process.env.RSA_KEYGEN_BITS}`, {
                    cwd: __dirname,
                    //FIXME not working in docker container
                    stdio: ["ignore", "ignore", "inherit"]
                });

                execSync("openssl rsa -pubout -in ./private-key.pem -out ./public-key.pem", {
                    cwd: __dirname,
                    //FIXME not working in docker container
                    stdio: ["ignore", "ignore", "inherit"]
                });

                log.info("Public/private key-pair generated");

            } catch (e) {

                log.error(e, "Could not create public/private key-pair");
                process.exit(1);

            }
        } else {
            log.error(err, "Could not access public/private key-pair");
        }
    } else {
        log.verbose("Public/private key-pair found");
    }
});
