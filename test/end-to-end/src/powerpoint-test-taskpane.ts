import { pingTestServer, sendTestResults } from "office-addin-test-helpers";
import { run } from "../../../src/taskpane/powerpoint";
import * as testHelpers from "./test-helpers";

/* global Office, Promise */

const port: number = 4201;
let testValues: any = [];

Office.onReady(async (info) => {
  if (info.host === Office.HostType.PowerPoint) {
    const testServerResponse: object = await pingTestServer(port);
    if (testServerResponse["status"] == 200) {
      runTest();
    }
  }
});

async function getSelectedText(): Promise<string> {
  return new Promise((resolve, reject) => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result: Office.AsyncResult<string>) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        resolve(result.value);
      }
    });
  });
}

export async function runTest(): Promise<void> {
  // Execute taskpane code
  await run();

  // get selected text
  const selectedText = await getSelectedText();

  // send test results
  testHelpers.addTestResult(testValues, "output-message", selectedText, "Hello World!");

  await sendTestResults(testValues, port);
}
