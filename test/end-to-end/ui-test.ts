import * as assert from "assert";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import * as officeAddinTestHelpers from "office-addin-test-helpers";
import * as officeAddinTestServer from "office-addin-test-server";
import * as path from "path";
import * as testHelpers from "./src/test-helpers";

/* global process, describe, before, it, after */

const hosts = ["Excel", "PowerPoint", "Word"];
const manifestPath = path.resolve(`${process.cwd()}/test/end-to-end/test-manifest.xml`);
const testServerPort: number = 4201;

hosts.forEach(function (host) {
  const testServer = new officeAddinTestServer.TestServer(testServerPort);
  let testValues: any = [];

  describe(`Test ${host} Task Pane Project`, function () {
    before(`Setup test environment and sideload ${host}`, async function () {
      this.timeout(0);
      // Start test server and ping to ensure it's started
      const testServerStarted = await testServer.startTestServer(true /* mochaTest */);
      const serverResponse = await officeAddinTestHelpers.pingTestServer(testServerPort);
      assert.strictEqual(testServerStarted, true);
      assert.strictEqual(serverResponse["status"], 200);

      // Call startDebugging to start dev-server and sideload
      const devServerCmd = `npm run dev-server -- --config ./test/end-to-end/webpack.config.js `;
      const devServerPort = parseNumber(process.env.npm_package_config_dev_server_port || 3000);
      await startDebugging(manifestPath, {
        app: toOfficeApp(host),
        appType: AppType.Desktop,
        devServerCommandLine: devServerCmd,
        devServerPort: devServerPort,
        enableDebugging: false,
      });
    }),
      describe(`Get test results for ${host} taskpane project`, function () {
        it("Validate expected result count", async function () {
          this.timeout(0);
          testValues = await testServer.getTestResults();
          assert.strictEqual(testValues.length > 0, true);
        });
        it("Validate expected result name", async function () {
          assert.strictEqual(
            testValues[0].resultName,
            host.toLowerCase() === "excel" ? "fill-color" : "output-message"
          );
        });
        it("Validate expected result", async function () {
          assert.strictEqual(testValues[0].resultValue, testValues[0].expectedValue);
        });
      });
    after(`Teardown test environment and shutdown ${host}`, async function () {
      this.timeout(0);
      // Stop the test server
      const stopTestServer = await testServer.stopTestServer();
      assert.strictEqual(stopTestServer, true);

      const applicationClosed = await testHelpers.closeDesktopApplication(host);
      assert.strictEqual(applicationClosed, true);
    });
  });
});

after(`Unregister the add-in`, async function () {
  return stopDebugging(manifestPath);
});
