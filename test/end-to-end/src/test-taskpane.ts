import functionsJsonData from "./test-data.json";
import { pingTestServer, sendTestResults } from "office-addin-test-helpers";
import { closeWorkbook, sleep } from "./test-helpers";

/* global Office, document, Excel, run, navigator */
const customFunctionsData = (<any>functionsJsonData).functions;
const port: number = 4201;
let testValues = [];

Office.onReady(async () => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";
  document.getElementById("run").onclick = run;
  addTestResult("UserAgent", navigator.userAgent);

  const testServerResponse: object = await pingTestServer(port);
  if (testServerResponse["status"] === 200) {
    await runCfTests();
    await sendTestResults(testValues, port);
    await closeWorkbook();
  }
});

async function runCfTests(): Promise<void> {
  // Exercise custom functions
  await Excel.run(async (context) => {
    for (let key in customFunctionsData) {
      const formula: string = customFunctionsData[key].formula;
      const range = context.workbook.getSelectedRange();
      range.formulas = [[formula]];
      await context.sync();

      await sleep(5000);

      // Check to if this is a streaming function
      await readCFData(key, customFunctionsData[key].streaming != undefined ? 2 : 1);
    }
  });
}

export async function readCFData(cfName: string, readCount: number): Promise<void> {
  await Excel.run(async (context) => {
    // if this is a streaming function, we want to capture two values so we can
    // validate the function is indeed streaming
    for (let i = 0; i < readCount; i++) {
      try {
        const range = context.workbook.getSelectedRange();
        range.load("values");
        await context.sync();

        await sleep(5000);

        addTestResult(cfName, range.values[0][0]);
        Promise.resolve();
      } catch {
        Promise.reject();
      }
    }
  });
}

function addTestResult(resultName: string, resultValue: any) {
  var data = {};
  var nameKey = "Name";
  var valueKey = "Value";
  data[nameKey] = resultName;
  data[valueKey] = resultValue;
  testValues.push(data);
}
