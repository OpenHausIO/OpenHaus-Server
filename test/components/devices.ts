const assert = require("assert");
const sinon = require('sinon');

import C_DEVICES = require("../../src/components/devices");

//@ts-ignore
const { events, hooks } = C_DEVICES;

import { ObjectId } from "bson";

describe("Devices", () => {

    describe("- init", () => {

        it("sets .ready property to true", (done) => {

            Promise.race([
                new Promise((resolve, reject) => {

                    //@ts-ignore
                    if (C_DEVICES.ready) {
                        resolve();
                    }

                }),
                new Promise((resolve, reject) => {
                    //@ts-ignore
                    C_DEVICES.events.on("ready", resolve);
                })
            ]).then(() => {

                //done();

                //@ts-ignore
                assert.equal(C_DEVICES.ready, true);
                done();

            }).catch(done);

        });


        it("loads all devices in an array, length: 0", () => {

            //@ts-ignore
            assert.equal(C_DEVICES.DEVICES.length, 0);

        });


    });

    describe("- Add", () => {

        it('emit added event', function () {

            let spy = sinon.spy();

            events.on('added', spy);
            spy.called.should.equal.true;

        });

        it('trigger add hook', function () {

            let spy = sinon.spy();

            hooks.on('add', spy);

            //@ts-ignore
            C_DEVICES.add();

            spy.called.should.equal.true;

        });

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