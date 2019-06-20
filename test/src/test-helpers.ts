
export async function closeWorkbook(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            await Excel.run(async context => {
                // @ts-ignore
                context.workbook.close(Excel.CloseBehavior.skipSave);
                resolve();
            });
        } catch {
            reject();
        }
    });
}

export function addTestResult(testValues: any[], resultName: string, resultValue: any, expectedValue: any) {
    var data = {};
    data["expectedValue"] = expectedValue;
    data["resultName"] = resultName;
    data["resultValue"] = resultValue;
    testValues.push(data);
}
