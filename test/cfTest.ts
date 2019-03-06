import * as functionsJsonData from './functionsTestData.json';
import {pingTestServer, sendTestResults} from "office-addin-test-helpers";
const customFunctions = (<any>functionsJsonData).functions;
const port: number = 8080;
let testValues = [];

export async function isTestServerStarted(): Promise<void> {
    const testServerResponse: any = await pingTestServer(port);
    if (testServerResponse["status"] === 200) {
        runCfTests(testServerResponse["platform"]);
    }
}

export async function runCfTests(platform: string): Promise<void> {
    await Excel.run(async context => {
        for (let key in customFunctions) {
            const formula: string = customFunctions[key].formula;
            const range = context.workbook.getSelectedRange();
            range.formulas = [[formula]];
            await context.sync();

            // Mac is much slower so we need to wait longer for the function to return a value
            await sleep(platform === "Win32" ? 2000 : 8000);

            // Check to if this is a streaming function
            await readData(key, customFunctions[key].streaming != undefined ? 2 : 1, platform)
        }
    });

    await sendTestResults(testValues, port);
}

export async function readData(cfName: string, readCount: number, platform: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
        await Excel.run(async context => {
            // if this is a streaming function, we want to capture two values so we can
            // validate the function is indeed streaming
            for (let i = 0; i < readCount; i++) {
                try {
                    const range = context.workbook.getSelectedRange();
                    range.load("values");
                    await context.sync();

                    // Mac is much slower so we need to wait longer for the function to return a value
                    await sleep(platform === "Win32" ? 2000 : 8000);

                    var data = {};
                    var nameKey = "Name";
                    var valueKey = "Value";
                    data[nameKey] = cfName;
                    data[valueKey] = range.values[0][0];
                    testValues.push(data);
                    resolve(true);

                } catch (err) {
                    throw new Error(err);
                }
            }
        });
    });
}

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

