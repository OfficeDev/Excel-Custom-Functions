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

let messageId = 0;
let connectionOpened = false;
const limitOfReconnectTries = 25;

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectToWebsocket(url: string, reconnectTry: number = 1): Promise<WebSocket | undefined> {
    return new Promise((resolve) => {
        console.log("Attempting to connect to websocket...");
        const ws = new WebSocket(url);
    
        ws.onopen = () => {
            console.log('connection opened');
            connectionOpened = true;
            return resolve(ws);
        };
        ws.onerror = (err) => {
            if(connectionOpened) {
                assert.fail(`Websocket error: ${err.message}`);
            }
        };
        ws.onmessage = (data) => {
            console.log("Message = ");
            console.log(data);
            console.log("Message JSON = ");
            console.log(JSON.parse(data));
            console.log("JSON parse message error = ");
            console.log(JSON.parse(data).error);
            assert.strictEqual(JSON.parse(data).error, undefined);
        };
        ws.onclose = async () => {
            console.log("Closing on reconnect try = " + reconnectTry);
            if(connectionOpened) {
                console.log("Closing websocket");
            } else if(reconnectTry < limitOfReconnectTries) {
                await sleep(1000);
                return resolve(await connectToWebsocket(url, reconnectTry+1));
            } else {
                console.log("Return reject");
                return resolve(undefined);
            }
        };
    });
}

/*function sendWebsocketMessage(method : string) {
    messageId++;
    ws.send(JSON.stringify({
        id: messageId,
        method: method
    }));
}*/

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
            enableDebugging: true
        };
        await startDebugging(manifestPath, options);
    });
    describe("Test Debugger", function () {
        let ws: WebSocket;
        before("Open websocket connection to Debugger", async function () {
            this.timeout(limitOfReconnectTries * 10000);
            const url = 'ws://localhost:9229/runtime1';
            ws = await connectToWebsocket(url);
            console.log("After connecting");
            assert.notStrictEqual(ws, undefined, "Websocket could not be open");
        }),
        it("enable debugging", async function () {
            //sendWebsocketMessage('Debugger.enable');
            ws.send(JSON.stringify({
                id: 1,
                method: 'Debugger.enable'
            }));
            //await sleep(1000);
        });
        it("pause debugging", async function () {
            //sendWebsocketMessage('Debugger.pause');
            //await sleep(1000);
        });
        it("resume debugging", async function () {
            //sendWebsocketMessage('Debugger.resume');
            //await sleep(1000);
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