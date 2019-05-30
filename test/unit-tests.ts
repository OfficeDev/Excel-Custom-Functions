import * as assert from "assert";
import * as functions from "./../src/functions/functions";
import * as mocha from "mocha";

describe("Test Excel Custom Functions", function () {
    describe("Test add function", function () {
        it(`Add function should return expected value`, async function () {
            assert.equal(functions.add(5, 6), 11);
        });
    });
    describe("Test logMessage function", function () {
        it(`LogMessage function should return expected value`, async function () {
            const message: string = "Hello World!"
            assert.equal(functions.logMessage(message), message);
        });
    });
    describe("Test currentTime function", function () {
        it(`CurrentTime function should return time value`, async function () {
            const time = functions.currentTime();
            assert.equal(time.includes("AM") || time.includes("PM"), true);
        });
    });
});
