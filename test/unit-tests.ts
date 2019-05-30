import * as assert from "assert";
import * as functions from "./../src/functions/functions";
import * as mocha from "mocha";

describe("Custom Functions Unit Tests", function () {
    describe("Test add() function", function () {
        it(`add two positive numbers`, async function () {
            assert.equal(functions.add(5, 6), 11);
        });
        it(`add two negative numbers`, async function () {
            assert.equal(functions.add(-2, -6), -8);
        });
        it(`add one to max number value`, async function () {
            assert.equal(functions.add(1, Number.MAX_VALUE), 1.7976931348623157e+308);
        });
    });
    describe("Test logMessage() function", function () {
        it(`log basic string`, async function () {
            const message: string = "Hello World!"
            assert.equal(functions.logMessage(message), message);
        });
        it(`log empty string`, async function () {
            const message: string = ""
            assert.equal(functions.logMessage(message), message);
        });
        it(`log international string`, async function () {
            const message: string = "こんにちは世界"
            assert.equal(functions.logMessage(message), message);
        });
    });
    describe("Test currentTime() function", function () {
        it(`get current time`, async function () {
            const time = functions.currentTime();
            assert.equal(typeof time === "string", true);
        });
    });
});
