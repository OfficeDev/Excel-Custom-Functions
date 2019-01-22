import * as childProcess from "child_process";
import * as cps from "current-processes";
import * as cors from "cors";
import * as fs from "fs";
import * as express from "express";
let devServerStarted : boolean = false;
var server : any;
var subProcess: any;
const app : any = express();

export async function startTestServer(): Promise<boolean> {
    return new Promise<boolean>(async function(resolve) {
        const key = fs.readFileSync('certs/server.key');
        const cert = fs.readFileSync('certs/server.crt');
        const options = { key: key, cert: cert };
        
        app.use(cors())
        app.get('/ping', function(req, res, next) {
            res.send(process.platform === "win32" ? 'Win32' : 'Mac');
            resolve(true);
        });
        
        const https = require('https');
        server = https.createServer(options, app);
        
        // listen for new web clients:
        server.listen(8080, function() {
            console.log("Test Server started");
        });
    });
}

export async function setupTestEnvironment(): Promise<boolean> {
    return new Promise<boolean>(async function(resolve, reject) {

        if (process.platform !== 'win32' && process.platform !== 'darwin') {
            reject();
          }

        devServerStarted = await _startDevServer();
        let sideLoadSuceeded : boolean = false      
        try {
            console.log(`Sideload Custom Functions in Excel`);
            const cmdLine = "npm run sideload";
            sideLoadSuceeded = await _executeCommandLine(cmdLine);
        } catch (err) {
            console.log(`Unable to sideload Excel. ${err}`);
        }
        resolve(devServerStarted && sideLoadSuceeded);
    });
}

async function _executeCommandLine(cmdLine): Promise<boolean> {
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

export async function getTestResults(): Promise<any> {
    return new Promise<any>(async function(resolve) {
        app.get('/results', function(req,res) {
            res.send('200');
            const jsonData : JSON = JSON.parse(req.query.data);
            server.close();
            resolve(jsonData);
    });
});
}

export async function teardownTestEnvironment(processName: string):Promise<void> {
    const operatingSystem: string = process.platform;
    try {
        if (operatingSystem == 'win32') {
            const cmdLine = `tskill ${processName}`;
            await _executeCommandLine(cmdLine);
        } else {
            const pid = await _getProcessId(processName);
            if (pid != undefined) {
                    process.kill(pid);
                }
            }
        } catch (err) {
        console.log(`Unable to kill Excel process. ${err}`);
    }

    // if the dev-server was started, kill the spawned process
    if (devServerStarted) {
        if (operatingSystem == 'win32') {
            childProcess.spawn("taskkill", ["/pid", subProcess.pid, '/f', '/t']);
        } else {
            subProcess.kill();
        }
    }
}

async function _startDevServer(): Promise<boolean> {
    devServerStarted = false;
    const cmdLine = "npm run dev-server";
    subProcess = childProcess.spawn(cmdLine, [], {
        detached: true,
        shell: true,
        stdio: "ignore"
    });
    subProcess.on("error", (err) => {
    console.log(`Unable to run command: ${cmdLine}.\n${err}`);
});
return subProcess.pid != undefined;
}

async function _getProcessId(processName: string): Promise<number> {
    return new Promise<number>(async function(resolve) {
        cps.get(function(err: Error, processes) {
            try {
                const p = processes.filter(function(p) {
                    return (p.name.indexOf(processName) > 0);
                });
                resolve(p.length > 0 ? p[0].pid : undefined);
            }
            catch (err) {
                console.log("Unable to get list of processes");
            }
        });
    });
}