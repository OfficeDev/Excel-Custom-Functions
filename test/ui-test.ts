import * as assert from "assert";
import * as fs from "fs";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { pingTestServer } from "office-addin-test-helpers";
import { closeDesktopApplication } from "./src/test-helpers";
import * as officeAddinTestServer from "office-addin-test-server";
import * as path from "path";

/* global process, describe, before, it, after */
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
    assert.strictEqual(serverResponse["status"], 200);
    assert.strictEqual(testServerStarted, true);

    // Call startDebugging to start dev-server and sideload
    const devServerCmd = `npm run dev-server -- --config ./test/webpack.config.js`;
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
      // Expecting six result values
      testValues = await testServer.getTestResults();
      assert.strictEqual(testValues.length, 6);
    });
    it("ADD function should return expected value", async function () {
      assert.strictEqual(testJsonData.functions.ADD.result, testValues[0].Value);
    });
    it("CLOCK function should return expected value", async function () {
      // Check that captured values are different to ensure the function is streaming
      assert.notStrictEqual(testValues[1].Value, testValues[2].Value);
      // Check if the returned string contains 'AM', 'PM', or 'GMT', indicating it's a time-stamp
      assert.strictEqual(
        testValues[1].Value.includes(testJsonData.functions.CLOCK.result.amString) ||
          testValues[1].Value.includes(testJsonData.functions.CLOCK.result.pmString) ||
          testValues[1].Value.includes(testJsonData.functions.CLOCK.result.timeZoneString),
        true,
        "Found timestamp indicator string in first value '" + testValues[1].Value + "'"
      );
      assert.strictEqual(
        testValues[2].Value.includes(testJsonData.functions.CLOCK.result.amString) ||
          testValues[2].Value.includes(testJsonData.functions.CLOCK.result.pmString) ||
          testValues[2].Value.includes(testJsonData.functions.CLOCK.result.timeZoneString),
        true,
        "Found timestamp indicator string in second value '" + testValues[2].Value + "'"
      );
    });
    it("INCREMENT function should return expected value", async function () {
      // Check that captured values are different to ensure the function is streaming
      assert.notStrictEqual(testValues[3].Value, testValues[4].Value);
      // Check to see that both captured streaming values are divisible by 4
      assert.strictEqual(0, testValues[3].Value % testJsonData.functions.INCREMENT.result);
      assert.strictEqual(0, testValues[4].Value % testJsonData.functions.INCREMENT.result);
    });
    it("LOG function should return expected value", async function () {
      assert.strictEqual(testJsonData.functions.LOG.result, testValues[5].Value);
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
