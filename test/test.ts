import * as assert from "assert";
import * as fs from "fs";
import * as mocha from "mocha";
import * as path from "path";
import * as testHelper from "office-addin-test-helpers";
import * as testServerInfra from "office-addin-test-server";

const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/manifest.xml`);
const port: number = 4201;
const testDataFile: string = `${process.cwd()}/test/src/testData.json`;
const testJsonData = JSON.parse(fs.readFileSync(testDataFile).toString());
const testServer = new testServerInfra.TestServer(port);
let testValues: any = [];

describe("Test Excel Custom Functions", function () {
    before("Start test server", async function () {
        const testServerStarted = await testServer.startTestServer(true /* mochaTest */);
        const serverResponse = await testHelper.pingTestServer(port);
        assert.equal(testServerStarted, true);
        assert.equal(serverResponse["status"], 200);
    }),
        describe("Start dev-server and sideload application", function () {
            it(`Sideload should have completed for ${host} and dev-server should have started`, async function () {
                this.timeout(0);
                const startDevServer = await testHelper.startDevServer();
                const sideloadApplication = await testHelper.sideloadDesktopApp(host, manifestPath);
                assert.equal(startDevServer, true);
                assert.equal(sideloadApplication, true);
            });
        });
    describe("Get test results for custom functions and validate results", function () {
        it("should get results from the taskpane application", async function () {
            this.timeout(0);
            // Expecting six result values
            testValues = await testServer.getTestResults();
            assert.equal(testValues.length, 6);
        });
        it("ADD function should return expected value", async function () {
            assert.equal(testJsonData.functions.ADD.result, testValues[0].Value);
        });
        it("CLOCK function should return expected value", async function () {
            // Check that captured values are different to ensure the function is streaming
            assert.notEqual(testValues[1].Value, testValues[2].Value);
            // Check if the returned string contains 'AM' or 'PM', indicating it's a time-stamp
            assert.equal(true, testValues[1].Value.includes(testJsonData.functions.CLOCK.result.amString) || testValues[1].Value.includes(testJsonData.functions.CLOCK.result.pmString) ? true : false);
            assert.equal(true, testValues[2].Value.includes(testJsonData.functions.CLOCK.result.amString) || testValues[2].Value.includes(testJsonData.functions.CLOCK.result.pmString) ? true : false);
        });
        it("INCREMENT function should return expected value", async function () {
            // Check that captured values are different to ensure the function is streaming
            assert.notEqual(testValues[3].Value, testValues[4].Value);
            // Check to see that both captured streaming values are divisible by 4
            assert.equal(0, testValues[3].Value % testJsonData.functions.INCREMENT.result);
            assert.equal(0, testValues[4].Value % testJsonData.functions.INCREMENT.result);
        });
        it("LOG function should return expected value", async function () {
            assert.equal(testJsonData.functions.LOG.result, testValues[5].Value);
        });
    });
    after("Teardown test environment", async function () {
        const stopTestServer = await testServer.stopTestServer();
        assert.equal(stopTestServer, true);
        const testEnvironmentTornDown = await testHelper.teardownTestEnvironment(host);
        assert.equal(testEnvironmentTornDown, true);
    });
});