import * as assert from "assert";
import { sleep } from './test-helpers';
const WebSocket = require("ws");

let connectionOpened = false;
let messageId = 0;
const limitOfReconnectTries = 60;

export async function connectToWebsocket(url: string, reconnectTry: number = 1): Promise<WebSocket | undefined> {
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

export function composeWsMessage(method : string) {
    return JSON.stringify({
        id: ++messageId,
        method: method
    });
}

export async function enableDebugging (ws: WebSocket) {
    ws.send(composeWsMessage('Debugger.enable'));
    await sleep(1000);
}

export async function pauseDebugging (ws: WebSocket) {
    ws.send(composeWsMessage('Debugger.pause'));
    await sleep(1000);
}

export async function resumeDebugging (ws: WebSocket) {
    ws.send(composeWsMessage('Debugger.resume'));
    await sleep(1000);
}
