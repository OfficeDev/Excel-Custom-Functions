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
const manifestPath = path.resolve(`${process.cwd()}/test/manifests/test-manifest-debugging.xml`);

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let ws;
let messageId = 0;
function sendWebsocketMessage(method : string) {
    messageId++;
    ws.send(JSON.stringify({
        id: messageId,
        method: method
    }));
}

describe("Test Excel Custom Functions", function () {
    before(`Setup test environment and sideload ${host}`, async function () {
        this.timeout(0);
        // Call startDebugging to start dev-server and sideload
        const devServerCmd = `npm run dev-server -- --config ./test/webpack-debugging.config.js`;
        const devServerPort = parseNumber(3001);
        const options = { 
            appType: AppType.Desktop, 
            app: toOfficeApp(host), 
            devServerCommandLine: devServerCmd, 
            devServerPort: devServerPort, 
            enableDebugging: true // Put true here, false just for testing the tester
        };
        await startDebugging(manifestPath, options);
    });
    describe("Test Debugger", function () {
        before("Open websocket connection to Debugger", async function () {
            this.timeout(12000);
            await sleep(10000);
            const url = 'ws://localhost:9229/runtime1';
            ws = new WebSocket(url);
            await sleep(1000);

            let websocketOpened = false;
            for(let i = 0; i < 10 && !websocketOpened; i ++) {
                await(sleep(1000));
            }

            ws.on('error', (err) => {
                assert.fail(`Connection could not be established. ${err}`);
            });

            ws.on('message', (data) => {
                assert.equal(JSON.parse(data).error, undefined);
            });
        }),
        it("enable debugging", function () {
            sendWebsocketMessage('Debugger.enable');
        });
        it("pause debugging", function () {
            sendWebsocketMessage('Debugger.pause');
        });
        it("resume debugging", function () {
            sendWebsocketMessage('Debugger.resume');
        });
        after("Close websocket connection", async function() {
            await sleep(1000);
            ws.close();
        });
    });
    after("Teardown test environment", async function () {
        this.timeout(0);
        // Unregister the add-in
        await stopDebugging(manifestPath);
    });
});