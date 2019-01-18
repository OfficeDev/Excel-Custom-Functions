import * as functionsJsonData from './functionsTestData.json';
const customFunctions = (<any>functionsJsonData).functions;
let cfValues = [];

export async function runCfTests(operatingSystem: string): Promise<void> {
    await Excel.run(async context => {
        for (let key in customFunctions)
        {
            const formula : string = customFunctions[key].formula;
            const range = context.workbook.getSelectedRange();
            range.formulas = [[formula]];
            await context.sync();

            // Mac is much slower so we need to wait longer for the function to return a value
            await sleep(operatingSystem === "Win32" ? 2000 : 8000);

            // Check to if this is a streaming function
            await readData(key, customFunctions[key].streaming != undefined ? 2 : 1, operatingSystem)            
        }
    });
    
    sendData(cfValues);
}

async function readData(cfName: string, readCount: number, operatingSystem: string): Promise<void> {
    await Excel.run(async context => {
        // if this is a streaming function, we want to capture two values so we can
        // validate the function is indeed streaming
        for (let i = 0; i < readCount; i++)
        {
            const range = context.workbook.getSelectedRange();
            range.load("values");
            await context.sync();

            // Mac is much slower so we need to wait longer for the function to return a value
            await sleep(operatingSystem === "Win32" ? 2000 : 8000);

            var data  = {};
            var nameKey = "Name";
            var valueKey = "Value";            
            data[nameKey] = cfName;
            data[valueKey] = range.values[0][0];
            cfValues.push(data);
        }
    });
}

async function sendData(values: any): Promise<void> {
    //make cfValues a json blob that we can pass in single request to test server
    var json = JSON.stringify(values);
    const xhr = new XMLHttpRequest();
    const url: string =`https://localhost:8080/results/`;
    let dataUrl : string = url + "?data=" + encodeURIComponent(json);
    xhr.open("GET", dataUrl, true);
    xhr.send();
}

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
