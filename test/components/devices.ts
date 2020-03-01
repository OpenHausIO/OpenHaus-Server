const assert = require("assert");
import C_DEVICES = require("../../src/components/devices");
import { ObjectId } from "bson";

describe("Devices", () => {

    describe("- init", () => {

        it("loads all devices in an array", (done) => {

            //@ts-ignore
            if (C_DEVICES.ready) {
                done();
                return;
            } else {
                //@ts-ignore
                C_DEVICES.events.on("ready", done);
            }

        });

    });

    describe("- Add", () => {

        it("[promise] create new document in database", () => {

            //@ts-ignore
            return C_DEVICES.add({
                name: "Device #1",
                icon: "dummy",
                enabled: true,
                interfaces: [{
                    type: "ETHERNET",
                    adapter: new ObjectId(), // fake adapter
                    settings: {
                        host: "127.0.0.1",
                        port: 8080,
                        path: "/",
                        protocol: "tcp"
                    }
                }]
            });

        });

        it("[callback] create new document in database", (done) => {

            //@ts-ignore
            C_DEVICES.add({
                name: "Device #2",
                icon: "dummy",
                enabled: true,
                interfaces: [{
                    type: "ETHERNET",
                    adapter: new ObjectId(), // fake adapter
                    settings: {
                        host: "127.0.0.1",
                        port: 8080,
                        path: "/",
                        protocol: "tcp"
                    }
                }]
            }, done);

        });

    });

    describe("- Fetch", () => {
        it("should return -1 when the value is not present", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
        it("test", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

    describe("- Remove", () => {
        it("should return -1 when the value is not present", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
        it("test", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

    describe("- Update", () => {
        it("should return -1 when the value is not present", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
        it("test", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

    describe("- Enable", () => {
        it("should return -1 when the value is not present", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
        it("test", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

    describe("- Disable", () => {
        it("should return -1 when the value is not present", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
        it("test", () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

});