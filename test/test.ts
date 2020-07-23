import rimraf = require("rimraf");
require("../src/environment");

// override env for tests
process.env.LOG_SUPPRESS = "true"; // we dont care about CLI messages from components
process.env.LOG_PATH = "/tmp/OpenHaus-test-logs"; // dump logfiles to temp
process.env.DB_NAME = String(Date.now()); // use fake/new/dummy database

// connect to database
const db = require("../src/database");



describe("OpenHaus - Server", () => {

    // handle database connetion
    before((done) => {
        if (db.readyState !== 1) {

            // add event listener
            db.once("open", done);
            db.once("error", done);

        } else {

            // we are connected
            done(null);

        }
    });


    // test helper libraries
    describe("Libraries", () => {
        //require("./devices");
        //require("./interfaces");
    });


    // test components
    describe("Components", () => {
        require("./components/devices");
        require("./components/interfaces");
    });


    // cleanup
    after((done) => {

        // remove log folder
        rimraf.sync(process.env.LOG_PATH);

        // remove test database
        db.dropDatabase(function () {
            db.close(done);
        });

    });

});