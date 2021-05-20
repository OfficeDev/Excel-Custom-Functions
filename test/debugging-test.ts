import * as assert from "assert";
import { after, before, describe, it } from "mocha";
import { parseNumber } from "office-addin-cli";
import { AppType, startDebugging, stopDebugging } from "office-addin-debugging";
import { toOfficeApp } from "office-addin-manifest";
import { closeDesktopApplication, sleep, closeWorkbook } from './src/test-helpers';
import * as path from "path";
const WebSocket = require("ws");
const host: string = "excel";
const manifestPath = path.resolve(`${process.cwd()}/test/configs/test-manifest-debugging.xml`);

let messageId = 0;
let connectionOpened = false;
const limitOfReconnectTries = 60;

async function connectToWebsocket(url: string, reconnectTry: number = 1): Promise<WebSocket | undefined> {
    return new Promise((resolve) => {
        console.log("Connecting to websocket...");
        const ws = new WebSocket(url);
    
        ws.onopen = () => {
            console.log('Connection opened');
            connectionOpened = true;
            return resolve(ws);
        };
        ws.onerror = (err) => {
            if(connectionOpened) {
                assert.fail(`Websocket error: ${err.message}`);
            }
        };
        ws.onmessage = (response) => {
            assert.strictEqual(JSON.parse(response.data).error, undefined, `Error: ${JSON.parse(response.data).error?.message}`);
        };
        ws.onclose = async () => {
            if(connectionOpened) {
                console.log("Closing websocket");
            } else if(reconnectTry < limitOfReconnectTries) {
                await sleep(1000);
                return resolve(await connectToWebsocket(url, reconnectTry+1));
            } else {
                return resolve(undefined);
            }
        };
    });
}

function composeWsMessage(method : string) {
    return JSON.stringify({
        id: ++messageId,
        method: method
    });
}

describe("Test Excel Custom Functions", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
        this.timeout(0);
        // Call startDebugging to start dev-server and sideload
        const devServerCmd = `npm run dev-server -- --config ./test/configs/webpack-debugging.config.js`;
        const devServerPort = parseNumber(3001);
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
            this.timeout(limitOfReconnectTries * 1000);
            const url = 'ws://localhost:9229/runtime1';
            ws = await connectToWebsocket(url);
            assert.notStrictEqual(ws, undefined, "Unable to connect to the websocket.");
        }),
        it("enable debugging", async function () {
            ws.send(composeWsMessage('Debugger.enable'));
            await sleep(1000);
        });
        it("pause debugging", async function () {
            ws.send(composeWsMessage('Debugger.pause'));
            await sleep(1000);
        });
        it("resume debugging", async function () {
            ws.send(composeWsMessage('Debugger.resume'));
            await sleep(1000);
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