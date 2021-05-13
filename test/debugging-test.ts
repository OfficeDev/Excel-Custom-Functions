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

async function connectToWebsocket(url: string): Promise<any> {
    for(let i = 0; i < 1; i ++) {
        console.log("Await i = " + i);
        try {
            await sleep(5000);
            ws = new WebSocket(url);
        } catch(err) {
            console.log("");
            console.log("");
            console.log("");
            console.log("err2 = ");
            console.log(err);
        }
    }
}

let ws;
let messageId = 0;
let connectionOpened = false;
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
        //await startDebugging(manifestPath, options);
    });
    describe("Test Debugger", function () {
        before("Open websocket connection to Debugger", async function () {
            this.timeout(25000);
            //await sleep(20000);
            //await sleep(10000);
            const url = 'ws://localhost:9229/runtime1';
            ws = new WebSocket(url);
            //await sleep(1000);

            //await connectToWebsocket(url);
            //await sleep(12000);

            ws.onopen = () => {
                console.log("");
                console.log("");
                console.log("");
                console.log("");
                console.log('connected opened');
            };
            ws.onerror = (err) => {
                console.log("");
                console.log("");
                console.log("");
                console.log("");
                console.log("err = ");
                console.log(err);
                if (ws.readyState !== WebSocket.OPEN) {
                    ws = new WebSocket(url);
                }
                else {
                    assert.fail(`Websocket error: ${err.message}`);
                }
            };

            ws.onmessage = (data) => {
                console.log("");
                console.log("");
                console.log("");
                console.log("");
                console.log("Message = " + data);
                assert.equal(JSON.parse(data).error, undefined);
            };
            while(ws.readyState !== WebSocket.OPEN) {
                console.log("Sleeping for 1 second zzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
                await sleep(1000);
            }
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