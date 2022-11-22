import * as childProcess from "child_process";

/* global process, Excel, setTimeout */

export async function closeWorkbook(): Promise<void> {
  await sleep(3000); // wait for host to settle
  try {
    await Excel.run(async (context) => {
      // @ts-ignore
      context.workbook.close(Excel.CloseBehavior.skipSave);
      Promise.resolve();
    });
  } catch (err) {
    Promise.reject(`Error on closing workbook: ${err}`);
  }
}

export function addTestResult(testValues: any[], resultName: string, resultValue: any, expectedValue: any) {
  var data = {};
  data["expectedValue"] = expectedValue;
  data["resultName"] = resultName;
  data["resultValue"] = resultValue;
  testValues.push(data);
}

export async function closeDesktopApplication(): Promise<boolean> {
  const processName: string = "Excel";

  try {
    let appClosed: boolean = false;
    if (process.platform == "win32") {
      const cmdLine = `tskill ${processName}`;
      appClosed = await executeCommandLine(cmdLine);
    }

    return appClosed;
  } catch (err) {
    throw new Error(`Unable to kill excel process. ${err}`);
  }
}

async function executeCommandLine(cmdLine: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    childProcess.exec(cmdLine, (error) => {
      if (error) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
