import * as assert from "assert";
import * as fs from "fs";
import * as mocha from "mocha";
import * as testHelper from "office-addin-test-helpers";
import * as testServerInfra from "office-addin-test-server";
const functionsJsonFile: string = `${__dirname}/functionsTestData.json`;
const functionsJsonData = JSON.parse(fs.readFileSync(functionsJsonFile).toString());
const port: number = 4201;
const testServer = new testServerInfra.TestServer(port);
let testValues : any = [];

describe("Setup test environment", function () {
    describe("Start sideload, start dev-server, and start test-server", function () {
        it("Sideload should have completed and dev-server should have started", async function () {
            this.timeout(0);
            const startDevServer = await testHelper.startDevServer();
            const sideloadApplication = await testHelper.sideloadDesktopApp("excel", "./test/test-manifest.xml");
            assert.equal(startDevServer, true);
            assert.equal(sideloadApplication, true);
        });
        it("Test server should have started and Excel taskpane should have pinged the server", async function () {
            this.timeout(0);
            const testServerStarted = await testServer.startTestServer();
            assert.equal(testServerStarted, true);
        });
    });
});

describe("Test Excel Custom Functions", function () {
    describe("Get test results for custom functions and validate results", function () {
        it("should get results from the taskpane application", async function () {
            this.timeout(0);
            // Expecting six result values
            testValues = await testServer.getTestResults();
            assert.equal(testValues.length, 6);
        });
        it("ADD function should return expected value", async function () {
            assert.equal(functionsJsonData.functions.ADD.result, testValues[0].Value);
        });
        it("CLOCK function should return expected value", async function () {
            // Check that captured values are different to ensure the function is streaming
            assert.notEqual(testValues[1].Value, testValues[2].Value);
            // Check if the returned string contains 'AM' or 'PM', indicating it's a time-stamp
            assert.equal(true, testValues[1].Value.includes(functionsJsonData.functions.CLOCK.result.amString) || testValues[1].Value.includes(functionsJsonData.functions.CLOCK.result.pmString) ? true : false);
            assert.equal(true, testValues[2].Value.includes(functionsJsonData.functions.CLOCK.result.amString) || testValues[2].Value.includes(functionsJsonData.functions.CLOCK.result.pmString) ? true : false);
        });
        it("INCREMENT function should return expected value", async function () {
            // Check that captured values are different to ensure the function is streaming
            assert.notEqual(testValues[3].Value, testValues[4].Value);
            // Check to see that both captured streaming values are divisible by 4
            assert.equal(0, testValues[3].Value % functionsJsonData.functions.INCREMENT.result);
            assert.equal(0, testValues[4].Value % functionsJsonData.functions.INCREMENT.result);
        });
        it("LOG function should return expected value", async function () {
            assert.equal(functionsJsonData.functions.LOG.result, testValues[5].Value);
        });
    });
});

describe("Teardown test environment", function () {
    describe("Kill Excel and the test server", function () {
        it("should close Excel and stop the test server", async function () {
            this.timeout(0);
            const stopTestServer = await testServer.stopTestServer();
            assert.equal(stopTestServer, true);
            await testHelper.teardownTestEnvironment("excel");
        });
    });
})