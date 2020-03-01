/*
import { Readable } from 'stream';
import path = require("path");
import tar = require("tar");
import fs = require("fs");


function extract(data, target, cb) {

    let prom = new Promise((resolve, reject) => {

        // create path to plugin
        let targetDir = path.resolve(process.cwd(), target);

        // create foder under .../plugins
        fs.mkdir(targetDir, (err) => {

            if (err) {
                reject(err);
                return;

            }

            let stream = data;

            //@ts-ignore
            if (Buffer.isBuffer(data) && !data.pipe) {
                stream = new Readable();
                stream.push(data);
                stream._read = () => { };
            }


            let transform = tar.x({
                strip: 1,
                C: targetDir
            });


            stream.pipe(transform).on("end", () => {
                resolve();
            }).on("error", (err) => {
                reject(err);
            });

        });

    });


    if (!cb) {
        return prom;
    }

    // use callback
    prom.then((data) => {
        cb(null, data);
    }).catch(cb);

}
*/