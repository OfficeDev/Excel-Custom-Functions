import functionsJsonData from "./test-data.json";
import { pingTestServer, sendTestResults } from "office-addin-test-helpers";
import { addErrorResult, closeWorkbook, formatError, sleep } from "./test-helpers";

/* global Office, document, Excel, run, navigator */
const customFunctionsData = (<any>functionsJsonData).functions;
const port: number = 4201;
let testValues: any[] = [];

Office.onReady(async () => {
  const sideloadMessage = document.getElementById("sideload-msg");
  const appBody = document.getElementById("app-body");
  const runButton = document.getElementById("run");

  if (sideloadMessage) {
    sideloadMessage.style.display = "none";
  }
  if (appBody) {
    appBody.style.display = "flex";
  }
  if (runButton) {
    runButton.onclick = run;
  }
  addTestResult("UserAgent", navigator.userAgent);

  try {
    const testServerResponse = (await pingTestServer(port)) as { status?: number };
    if (testServerResponse.status === 200) {
      await runTest();
    } else {
      addErrorResult(testValues, `Ping failed: ${JSON.stringify(testServerResponse)}`);
      await sendTestResults(testValues, port).catch(() => {});
    }
  } catch (err) {
    addErrorResult(testValues, `Initialization failed: ${formatError(err)}`);
    await sendTestResults(testValues, port).catch(() => {});
  }
});

async function runTest(): Promise<void> {
  try {
    await runCfTests();
    await sendTestResults(testValues, port);
    await closeWorkbook();
  } catch (err) {
    testValues = [];
    addErrorResult(testValues, `runTest failed: ${formatError(err)}`);
    await sendTestResults(testValues, port).catch(() => {});
  }
}

async function runCfTests(): Promise<void> {
  // Exercise custom functions
  for (let key in customFunctionsData) {
    const formula: string = customFunctionsData[key].formula;
    const readCount: number = customFunctionsData[key].streaming != undefined ? 2 : 1;
    let capturedValues: any[] = [];

    for (let attempt = 0; attempt < 3; attempt++) {
      await Excel.run(async (context: Excel.RequestContext) => {
        const range = context.workbook.getSelectedRange();
        range.formulas = [[formula]];
        await context.sync();
      });

      await sleep(5000);

      capturedValues = await readCFData(readCount);
      const hasCalcError = capturedValues.some((value) => typeof value === "string" && value.includes("#CALC!"));
      if (!hasCalcError) {
        break;
      }

      // Re-enter formula when custom function registration/evaluation is still warming up.
      await sleep(2000);
    }

    for (const value of capturedValues) {
      addTestResult(key, value);
    }
  }
}

export async function readCFData(readCount: number): Promise<any[]> {
  return Excel.run(async (context: Excel.RequestContext) => {
    const capturedValues: any[] = [];

    // if this is a streaming function, we want to capture two values so we can
    // validate the function is indeed streaming
    for (let i = 0; i < readCount; i++) {
      if (i > 0) {
        // For streaming functions, wait for the next emitted value.
        await sleep(5000);
      }

      const range = context.workbook.getSelectedRange();
      let value: any = undefined;

      // Retry a few times when Excel still reports transient calculation errors.
      for (let retry = 0; retry < 4; retry++) {
        range.load("values");
        await context.sync();
        value = range.values?.[0]?.[0];

        if (typeof value !== "string" || !value.includes("#CALC!")) {
          break;
        }

        await sleep(2000);
      }

      capturedValues.push(value);
    }

    return capturedValues;
  });
}

function addTestResult(name: string, value: any) {
  const data = {
    name: name,
    value: value,
  };
  testValues.push(data);
}
