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

let ws;
let messageId = 0;
let connectionOpened = false;

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectToWebsocket(url: string): Promise<any> {
    return new Promise(() => {
        console.log("Attempting to connect to websocket...");
        ws = new WebSocket(url);
    
        ws.onopen = () => {
            console.log('connection opened');
            connectionOpened = true;
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
            assert.equal(JSON.parse(data).error, undefined);
        };
        ws.onclose = async () => {
            if(connectionOpened) {
                console.log("Closing websocket");
            } else {
                await sleep(1000);
                await connectToWebsocket(url);
            }
        };
    });
}

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
            this.timeout(25000);
            const url = 'ws://localhost:9229/runtime1';
            await connectToWebsocket(url);
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