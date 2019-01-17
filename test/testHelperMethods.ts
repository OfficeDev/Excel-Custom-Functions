import * as childProcess from "child_process";
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
        
        app.get('/ping', function(req, res) {
            res.send('200');
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

export async function teardownTestEnvironment():Promise<void> {
    if (process.platform !== 'win32') {
        try {
            const cmdLine = "tskill excel";
            await _executeCommandLine(cmdLine);
        } catch (err) {
            console.log(`Unable to kill Excel process. ${err}`);
        }        
    }    

    // if the dev-server was started, kill the spawned process
    if (devServerStarted) {
        childProcess.spawn("taskkill", ["/pid", subProcess.pid, '/f', '/t']);
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