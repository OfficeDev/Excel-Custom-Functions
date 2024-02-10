import * as assert from "assert";
import { sleep } from "./test-helpers";
const WebSocket = require("ws");
const request = require("request");

/* global require, console */
let connectionOpened = false;
let messageId = 0;
const limitOfReconnectTries = 60;
let wsUrl: string | undefined;

function findUrl(jsonUrl: string): void {
  let options = { json: true };

  request(jsonUrl, options, (error, res, body) => {
    if (!error && res.statusCode == 200) {
      wsUrl = body[0].webSocketDebuggerUrl;
    }
  });
}

export async function connectToWebsocket(reconnectTry: number = 1): Promise<WebSocket | undefined> {
  // different JS engins used in office use different ports.  Allow for either one
  let jsonUrl = reconnectTry % 2 == 0 ? "http://127.0.0.1:9223/json" : "http://127.0.0.1:9229/json";

  while (!wsUrl && reconnectTry < limitOfReconnectTries) {
    console.log("Attaching debugger...");
    findUrl(jsonUrl);
    reconnectTry++;
    await sleep(1000);
  }

  return new Promise((resolve) => {
    console.log("Connecting to websocket...");
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connection opened");
      connectionOpened = true;
      return resolve(ws);
    };
    ws.onerror = (err) => {
      if (connectionOpened) {
        assert.fail(`Websocket error: ${err.message}`);
      }
    };
    ws.onmessage = (response) => {
      assert.strictEqual(
        JSON.parse(response.data).error,
        undefined,
        `Error: ${JSON.parse(response.data).error?.message}`
      );
    };
    ws.onclose = async () => {
      if (connectionOpened) {
        console.log("Closing websocket");
      } else if (reconnectTry < limitOfReconnectTries) {
        await sleep(1000);
        return resolve(await connectToWebsocket(reconnectTry + 1));
      } else {
        return resolve(undefined);
      }
    };
  });
}

export function composeWsMessage(method: string) {
  return JSON.stringify({
    id: ++messageId,
    method: method,
  });
}

export async function enableDebugging(ws: WebSocket) {
  ws.send(composeWsMessage("Debugger.enable"));
  await sleep(1000);
}

export async function pauseDebugging(ws: WebSocket) {
  ws.send(composeWsMessage("Debugger.pause"));
  await sleep(1000);
}

export async function resumeDebugging(ws: WebSocket) {
  ws.send(composeWsMessage("Debugger.resume"));
  await sleep(1000);
}
