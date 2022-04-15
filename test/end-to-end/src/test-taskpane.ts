import * as functionsJsonData from "./test-data.json";
import { pingTestServer, sendTestResults } from "office-addin-test-helpers";
import { closeWorkbook, sleep } from "./test-helpers";

/* global Office, document, Excel, run */
const customFunctionsData = (<any>functionsJsonData).functions;
const port: number = 4201;
let testValues = [];

Office.onReady(async () => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";
  document.getElementById("run").onclick = run;

  const testServerResponse: object = await pingTestServer(port);
  if (testServerResponse["status"] === 200) {
    await new Promise<void>(() => {
      addTestResult("ADD", "Nothing");
      Promise.resolve();
    });
    //await runCfTests();
    await sendTestResults(testValues, port);
    await closeWorkbook();
  }
});

async function runCfTests(): Promise<void> {
  // Exercise custom functions
  return new Promise<void>(() => {
    addTestResult("ADD", "Nothing");
    Promise.resolve();
  });
  // return Excel.run(async (context) => {
    // for (let key in customFunctionsData) {
    //   try {
    //     const formula: string = customFunctionsData[key].formula;
        // const range = context.workbook.getSelectedRange();
        // range.formulas = [[formula]];
        //await context.sync();

        // let sheet = context.workbook.worksheets.getActiveWorksheet();
        // let rangeTest = sheet.getRange("B1");
        // rangeTest.values = [["Set Formula"]];
        // await context.sync();

        // await sleep(5000);
        // addTestResult("ADD", "Nothing");

        // // Check to if this is a streaming function
        // await readCFData(key, customFunctionsData[key].streaming != undefined ? 2 : 1);
      // } catch {
      //   addTestResult(key, "Exception thrown");
      // }
    //}
  // });
}

// export async function readCFData(cfName: string, readCount: number): Promise<void> {
//   await Excel.run(async (context) => {
//     // if this is a streaming function, we want to capture two values so we can
//     // validate the function is indeed streaming
//     for (let i = 0; i < readCount; i++) {
//       try {
//         const range = context.workbook.getSelectedRange();
//         range.load("values");
//         await context.sync();

//         await sleep(5000);

//         addTestResult(cfName, range.values[0][0]);
//         Promise.resolve();
//       } catch {
//         Promise.reject();
//       }
//     }
//   });
// }

// export async function readCFData(cfName: string, readCount: number): Promise<boolean> {
//   return new Promise<boolean>(async (resolve, reject) => {
//     await Excel.run(async (context) => {
//       // if this is a streaming function, we want to capture two values so we can
//       // validate the function is indeed streaming
//       for (let i = 0; i < readCount; i++) {
//         try {
//           const range = context.workbook.getSelectedRange();
//           range.load("values");
//           await context.sync();

//           await sleep(5000);

//           addTestResult(cfName, range.values[0][0]);
//           resolve(true);
//         } catch {
//           reject(false);
//         }
//       }
//     });
//   });
// }

// export async function readCFData(cfName: string, readCount: number): Promise<void> {
//   await Excel.run(async (context) => {
//     // if this is a streaming function, we want to capture two values so we can
//     // validate the function is indeed streaming
//     for (let i = 0; i < readCount; i++) {
//       try {
//         const range = context.workbook.getSelectedRange();
//         range.load("values");
//         await context.sync();

//         await sleep(5000);

//         addTestResult(cfName, range.values[0][0]);
//       } catch (err: any) {
//         console.log(`Error trying to get function value: ${err}`);
//       }
//     }
//   });
// }

export async function readCFData(cfName: string, readCount: number): Promise<void> {
  await Excel.run(async (context) => {
    // if this is a streaming function, we want to capture two values so we can
    // validate the function is indeed streaming
    for (let i = 0; i < readCount; i++) {

      let sheet = context.workbook.worksheets.getActiveWorksheet();
      let rangeTest = sheet.getRange("B1");
      rangeTest.values = [["Read Value"]];
      await context.sync();

      const range = context.workbook.getSelectedRange();
      range.load("values");
      await context.sync();

      await sleep(5000);

      addTestResult(cfName, range.values[0][0]);
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
