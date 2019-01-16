const testFunctions = ['=CONTOSO.ADD(5,2)', '=CONTOSO.CLOCK()', '=CONTOSO.INCREMENT(4)', '=CONTOSO.LOG("this is a test")'];
let cfValues = [];

export async function runCfTests(): Promise<void> {
    await Excel.run(async context => {
    for (let i = 0; i < testFunctions.length; i++) {
    const range = context.workbook.getSelectedRange();
    const formula : string = testFunctions[i]
    range.formulas = [[formula]];
    await context.sync();
    await sleep(2000);

    // Check to if this is a streaming function
    await readData(formula.indexOf("INCREMENT") > 0 ? 2 : 1)
    }
});
sendData(cfValues);
}

async function readData(readCount: number): Promise<void> {
    await Excel.run(async context => {
        // if this is a streaming function, we want to capture two values so we can
        // validate the function is indeed streaming
        for (let i = 0; i < readCount; i++)
        {
            const range = context.workbook.getSelectedRange();
            range.load("values");
            await context.sync();
            
            var data = {"cfValue": range.values[0][0]};
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
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send();
}

async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
