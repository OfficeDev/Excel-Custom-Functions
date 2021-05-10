import * as assert from "assert";
import * as fs from "fs";
import { after, before, describe, it } from "mocha";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { pingTestServer } from "office-addin-test-helpers";
import * as officeAddinTestServer from "office-addin-test-server";
import * as path from "path";
const WebSocket = require("ws");
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/test-manifest.xml`);
const port: number = 4201;
const testDataFile: string = `${process.cwd()}/test/src/test-data.json`;
const testJsonData = JSON.parse(fs.readFileSync(testDataFile).toString());
const testServer = new officeAddinTestServer.TestServer(port);
let testValues: any = [];

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        const devServerPort = parseNumber(process.env.npm_package_config_dev_server_port || 3000);
        const options = { 
            appType: AppType.Desktop, 
            app: toOfficeApp(host), 
            devServerCommandLine: devServerCmd, 
            devServerPort: devServerPort, 
            enableDebugging: false
        };
        await startDebugging(manifestPath, options);
    });
    describe("Test Debugger", function () {
        let ws;
        before("Open websocket connection to Debugger", async function () {
            this.timeout(12000);
            await sleep(10000);
            const url = 'ws://localhost:9229/runtime1';
            ws = new WebSocket(url);
            await sleep(1000);

            ws.on('error', (err) => {
                assert.fail(`Connection could not be established. ${err}`);
            });
    
            ws.on('message', (data) => {
                assert.equal(JSON.parse(data).error, undefined);
            });
        }),
        it("enable debugging", function () {
            ws.send(JSON.stringify({
                id: 1,
                method: 'Debugger.enable'
            }));
        });
        it("pause debugging", function () {
            ws.send(JSON.stringify({
                id: 2,
                method: 'Debugger.pause'
            }));
        });
        it("resume debugging", function () {
            ws.send(JSON.stringify({
                id: 3,
                method: 'Debugger.resume'
            }));
        });
        after("Close websocket connection", async function() {
            await sleep(1000);
            ws.close();
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
        this.timeout(0);
        // Stop the test server
        const stopTestServer = await testServer.stopTestServer();
        assert.equal(stopTestServer, true);

        // Unregister the add-in
        await stopDebugging(manifestPath);
    });
});