import * as childProcess from "child_process";
import * as cps from "current-processes";
let devServerProcess: any;
let devServerStarted: boolean = false;

export async function startDevServer(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        devServerStarted = false;
        const cmdLine = "npm run dev-server-test";
        devServerProcess = childProcess.spawn(cmdLine, [], {
            detached: true,
            shell: true,
            stdio: "ignore"
        });
        devServerProcess.on("error", (err) => {
            reject(err);
        });

        devServerStarted = devServerProcess.pid != undefined;
        resolve(devServerStarted);
    });
}

export async function stopDevServer(): Promise<boolean> {
    return new Promise<boolean>(async function (resolve, reject) {
        let devServerKilled: boolean = false;
        if (devServerStarted) {
            try {
                if (process.platform == "win32") {
                    childProcess.spawn("taskkill", ["/pid", devServerProcess.pid, '/f', '/t']);
                } else {
                    devServerProcess.kill();
                }
                devServerKilled = true;
            } catch (err) {
                reject(`Stopping dev-server failed: ${err}`);
            }
        }
        resolve(devServerKilled);
    });
}

export async function closeDesktopApplication(application: string): Promise<boolean> {
    return new Promise<boolean>(async function (resolve, reject) {
        let processName: string = "";
        switch (application.toLowerCase()) {
            case "excel":
                processName = "Excel";
                break;
            case "powerpoint":
                processName = (process.platform === "win32") ? "Powerpnt" : "Powerpoint";
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
                reject(`${application} is not a valid Office desktop application.`);
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
                    resolve(false);
                }
            }
            resolve(appClosed);
        } catch (err) {
            reject(`Unable to kill ${application} process. ${err}`);
        }
    });
}

async function getProcessId(processName: string): Promise<number> {
    return new Promise<number>(async function (resolve, reject) {
        cps.get(function (err: Error, processes: any) {
            try {
                const processArray = processes.filter(function (p: any) {
                    return (p.name.indexOf(processName) > 0);
                });
                resolve(processArray.length > 0 ? processArray[0].pid : undefined);
            }
            catch (err) {
                reject(err);
            }
        });
    });
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