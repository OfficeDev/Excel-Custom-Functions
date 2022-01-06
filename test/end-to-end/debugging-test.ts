import * as assert from "assert";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { closeDesktopApplication } from "./src/test-helpers";
import { connectToWebsocket, enableDebugging, pauseDebugging } from "./src/debugger-websocket";
import * as path from "path";

/* global process, describe, before, it, after */
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/end-to-end/test-manifest-debugging.xml`);

describe("Test Excel Custom Functions", function () {
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
    await startDebugging(manifestPath, options);
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
    await stopDebugging(manifestPath);
  });
});
