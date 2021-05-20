import * as assert from "assert";
import { after, before, describe, it } from "mocha";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { closeDesktopApplication } from './src/test-helpers';
import { connectToWebsocket, enableDebugging, pauseDebugging, resumeDebugging } from './src/websocket-utils';
import * as path from "path";
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/configs/test-manifest-debugging.xml`);

describe("Test Excel Custom Functions", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
        this.timeout(0);
        // Call startDebugging to start dev-server and sideload
        const devServerCmd: string = `npm run dev-server -- --config ./test/webpack.config.js --testType debugger`;
        const devServerPort: number = 3001;
        const options = {
            appType: AppType.Desktop,
            app: toOfficeApp(host),
            devServerCommandLine: devServerCmd,
            devServerPort: devServerPort,
            enableDebugging: true
        };
        await startDebugging(manifestPath, options);
    });
    describe("Test Debugger", function () {
        let ws: WebSocket;
        before("Open websocket connection to Debugger", async function () {
            this.timeout(60 * 1000);
            const url = 'ws://localhost:9229/runtime1';
            ws = await connectToWebsocket(url);
            assert.notStrictEqual(ws, undefined, "Unable to connect to the websocket.");
        }),
        it("enable debugging", async function () {
            await enableDebugging(ws);
        });
        it("pause debugging", async function () {
            await pauseDebugging(ws);
        });
        it("resume debugging", async function () {
            await resumeDebugging(ws);
        });
        after("Close websocket connection", async function() {
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