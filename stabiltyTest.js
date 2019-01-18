const childProcess = require("child_process");
const promiseStartTests = _startTests();

runTests();

async function runTests()
{
    for(let i = 1; i <= 100; i++) {
        console.log(`Test pass #${i}`);
        const startTests = await _startTests();
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function _startTests() {
    return new Promise(async (resolve, reject) => {
        const cmdLine = "npm run test";
        subProcess = childProcess.spawn(cmdLine, [], {
            detached: true,
            shell: true,
            stdio: "ignore"
        });

        if (subProcess.pid != undefined) {
            console.log("Sleeping for 60 seconds")
            await sleep(50000);
            resolve();
        } else {
            reject();
        }
    });
}