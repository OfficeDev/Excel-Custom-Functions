import * as childProcess from "child_process";

/* global process, Excel, setTimeout */

export async function closeWorkbook(): Promise<void> {
  await sleep(3000); // wait for host to settle
  try {
    await Excel.run(async (context: Excel.RequestContext) => {
      // @ts-ignore
      context.workbook.close(Excel.CloseBehavior.skipSave);
      Promise.resolve();
    });
  } catch (err) {
    Promise.reject(`Error on closing workbook: ${err}`);
  }
}

export function addTestResult(testValues: any[], name: string, value: any, expectedValue: any) {
  testValues.push({
    expectedValue,
    name,
    value,
  });
}

export function addErrorResult(testValues: any[], errorMessage: string) {
  testValues.push({
    expectedValue: "no-error",
    name: "test-error",
    value: errorMessage,
  });
}

export function formatError(err: any): string {
  if (!err) {
    return "Unknown error (null/undefined)";
  }

  const parts: string[] = [];

  if (err.message) {
    parts.push(`Message: ${err.message}`);
  } else {
    parts.push(`${err}`);
  }

  if (err.code) {
    parts.push(`Code: ${err.code}`);
  }

  if (err.debugInfo) {
    if (err.debugInfo.code) {
      parts.push(`DebugCode: ${err.debugInfo.code}`);
    }
    if (err.debugInfo.message) {
      parts.push(`DebugMessage: ${err.debugInfo.message}`);
    }
    if (err.debugInfo.errorLocation) {
      parts.push(`Location: ${err.debugInfo.errorLocation}`);
    }
    if (err.debugInfo.innerError) {
      const inner = err.debugInfo.innerError;
      parts.push(`InnerError: ${inner.code || ""} ${inner.message || JSON.stringify(inner)}`);
    }
  }

  if (err.stack) {
    parts.push(`Stack: ${err.stack}`);
  }

  return parts.join(" | ");
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
