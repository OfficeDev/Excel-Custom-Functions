import * as assert from "assert";
import * as fs from "fs";
import * as mocha from "mocha";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { pingTestServer } from "office-addin-test-helpers";
import * as officeAddinTestServer from "office-addin-test-server";
import * as path from "path";
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/test-manifest.xml`);
const port: number = 4201;
const testDataFile: string = `${process.cwd()}/test/src/test-data.json`;
const testJsonData = JSON.parse(fs.readFileSync(testDataFile).toString());
const testServer = new officeAddinTestServer.TestServer(port);
let testValues: any = [];

describe("Test Excel Custom Functions", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
        this.timeout(0);
        // Start test server and ping to ensure it's started
        const testServerStarted = await testServer.startTestServer(true /* mochaTest */);
        const serverResponse = await pingTestServer(port);
        assert.equal(testServerStarted, true);
        assert.equal(serverResponse["status"], 200);

        // Call startDebugging to start dev-server and sideload
        const devServerCmd = `npm run dev-server -- --config ./test/webpack.config.js`;
        const sideloadCmd = `node ./node_modules/office-toolbox/app/office-toolbox.js sideload -m ${manifestPath} -a ${host}`;
        await startDebugging(manifestPath, AppType.Desktop, undefined, undefined, devServerCmd, undefined,
            undefined, undefined, undefined, sideloadCmd);
    }),
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
        this.timeout(0);
        // Stop the test server
        const stopTestServer = await testServer.stopTestServer();
        assert.equal(stopTestServer, true);

        // Unregister the add-in
        const unregisterCmd = `node ./node_modules/office-toolbox/app/office-toolbox.js remove -m ${manifestPath} -a ${host}`;
        await stopDebugging(manifestPath, unregisterCmd);
    });
});