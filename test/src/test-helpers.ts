import * as childProcess from "child_process";
import find = require("find-process")

/* global Excel, process, Promise, setTimeout */

export async function closeDesktopApplication(application: string): Promise<boolean> {
    let processName: string = "";
    switch (application.toLowerCase()) {
        case "excel":
            processName = "Excel";
            break;
        case "powerpoint":
            processName = (process.platform === "win32") ? "Powerpnt" : "PowerPoint";
            break;
        case "onenote":
            processName = "Onenote";
            break;
        case "outlook":
            processName = "Outlook";
            break;
        case "project":
            processName = "Project";
            break;
        case "word":
            processName = (process.platform === "win32") ? "Winword" : "Word";
            break;
        default:
            throw new Error(`${application} is not a valid Office desktop application.`);
    }

    try {
        let appClosed: boolean = false;
        if (process.platform == "win32") {
            const cmdLine = `tskill ${processName}`;
            appClosed = await executeCommandLine(cmdLine);
        } else {
            const pid = await getProcessId(processName);
            if (pid != undefined) {
                process.kill(pid);
                appClosed = true;
            } else {
                return false;
            }
        }
        
        return appClosed;
    } catch (err) {
        throw new Error(`Unable to kill ${application} process. ${err}`);
    }
}

export async function closeWorkbook(): Promise<void> {
    await Excel.run(async context => context.workbook.close(Excel.CloseBehavior.skipSave));
}

export function addTestResult(testValues: any[], resultName: string, resultValue: any, expectedValue: any) {
    var data = {};
    data["expectedValue"] = expectedValue;
    data["resultName"] = resultName;
    data["resultValue"] = resultValue;
    testValues.push(data);
}

export async function sleep(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProcessId(processName: string): Promise<number|undefined> {
    const [process] = await find('name', processName, false /* strict */)

    return process ? process.pid : undefined;
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