import * as assert from "assert";
import * as fs from "fs";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { pingTestServer } from "office-addin-test-helpers";
import { closeDesktopApplication } from "./src/test-helpers";
import { connectToWebsocket, enableDebugging, pauseDebugging } from "./src/debugger-websocket";
import * as officeAddinTestServer from "office-addin-test-server";
import * as path from "path";

/* global process, describe, before, it, after, console */
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/end-to-end/test-manifest.xml`);
const manifestPathDebugging = path.resolve(`${process.cwd()}/test/end-to-end/test-manifest-debugging.xml`);
const port: number = 4201;
const testDataFile: string = `${process.cwd()}/test/end-to-end/src/test-data.json`;
const testJsonData = JSON.parse(fs.readFileSync(testDataFile).toString());
const testServer = new officeAddinTestServer.TestServer(port);
let testValues: any = [];

describe("Test Excel Custom Functions", function () {
  describe("UI Tests", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
      this.timeout(0);
      // Start test server and ping to ensure it's started
      const testServerStarted = await testServer.startTestServer(true /* mochaTest */);
      const serverResponse = await pingTestServer(port);
      assert.strictEqual(serverResponse["status"], 200);
      assert.strictEqual(testServerStarted, true);

      // Call startDebugging to start dev-server and sideload
      const devServerCmd = `npm run dev-server -- --config ./test/end-to-end/webpack.config.js`;
      const devServerPort = parseNumber(process.env.npm_package_config_dev_server_port || 3000);
      const options = {
        appType: AppType.Desktop,
        app: toOfficeApp(host),
        devServerCommandLine: devServerCmd,
        devServerPort: devServerPort,
        enableDebugging: false,
      };
      await startDebugging(manifestPath, options);
    });
    describe("Get test results for custom functions and validate results", function () {
      it("should get results from the taskpane application", async function () {
        this.timeout(0);
        // Expecting six result values + user agent
        testValues = await testServer.getTestResults();
        console.log(`User Agent: ${testValues[0].Value}`);
        assert.strictEqual(testValues.length, 7);
      });
      it("ADD function should return expected value", async function () {
        assert.strictEqual(testJsonData.functions.ADD.result, testValues[1].Value);
      });
      it("CLOCK function should return expected value", async function () {
        // Check that captured values are different to ensure the function is streaming
        assert.notStrictEqual(testValues[2].Value, testValues[3].Value);
        // Check if the returned string contains 'AM', 'PM', or 'GMT', indicating it's a time-stamp
        assert.strictEqual(
          testValues[2].Value.includes(testJsonData.functions.CLOCK.result.amString) ||
          testValues[2].Value.includes(testJsonData.functions.CLOCK.result.pmString) ||
          testValues[2].Value.includes(testJsonData.functions.CLOCK.result.timeZoneString),
          true,
          "Found timestamp indicator string in first value '" + testValues[2].Value + "'"
        );
        assert.strictEqual(
          testValues[3].Value.includes(testJsonData.functions.CLOCK.result.amString) ||
          testValues[3].Value.includes(testJsonData.functions.CLOCK.result.pmString) ||
          testValues[3].Value.includes(testJsonData.functions.CLOCK.result.timeZoneString),
          true,
          "Found timestamp indicator string in second value '" + testValues[3].Value + "'"
        );
      });
      it("INCREMENT function should return expected value", async function () {
        // Check that captured values are different to ensure the function is streaming
        assert.notStrictEqual(testValues[3].Value, testValues[4].Value);
        // Check to see that both captured streaming values are divisible by 4
        assert.strictEqual(0, testValues[4].Value % testJsonData.functions.INCREMENT.result);
        assert.strictEqual(0, testValues[5].Value % testJsonData.functions.INCREMENT.result);
      });
      it("LOG function should return expected value", async function () {
        assert.strictEqual(testJsonData.functions.LOG.result, testValues[6].Value);
      });
    });
    after("Teardown test environment", async function () {
      this.timeout(0);
      // Stop the test server
      const stopTestServer = await testServer.stopTestServer();
      assert.strictEqual(stopTestServer, true);

      // Close excel
      const applicationClosed = await closeDesktopApplication();
      assert.strictEqual(applicationClosed, true);

      // Unregister the add-in
      await stopDebugging(manifestPath);
    });
  });
  describe("Debugger Tests", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
      this.timeout(0);
      // Call startDebugging to start dev-server and sideload
      const devServerCmd: string = `npm run dev-server -- --config ./test/end-to-end/webpack.config.js --env testType=debugger`;
      const devServerPort: number = 3001;
      const options = {
        appType: AppType.Desktop,
        app: toOfficeApp(host),
        devServerCommandLine: devServerCmd,
        devServerPort: devServerPort,
        enableDebugging: true,
      };
      await startDebugging(manifestPathDebugging, options);
    });
    describe("Test Debugger", function () {
      let ws: WebSocket;
      before("Open websocket connection to Debugger", async function () {
        this.timeout(60 * 1000);
        ws = await connectToWebsocket();
        assert.notStrictEqual(ws, undefined, "Unable to connect to the websocket.");
      });
      it("enable debugging", async function () {
        await enableDebugging(ws);
      });
      it("pause debugging", async function () {
        await pauseDebugging(ws);
      });
      after("Close websocket connection", async function () {
        ws.close();
      });
    });
    after("Teardown test environment", async function () {
      this.timeout(0);
      // Close excel
      const applicationClosed = await closeDesktopApplication();
      assert.strictEqual(applicationClosed, true);

      // Unregister the add-in
      await stopDebugging(manifestPathDebugging);
    });
  });
});
