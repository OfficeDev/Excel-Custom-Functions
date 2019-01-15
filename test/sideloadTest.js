const exec = require('child_process').exec
const fs = require('fs');
const assert = require('assert');
let cfValues = [];
let serverStarted = false;
var server;
const express = require('express');
const app = express();
const promiseStartServer = _startTestServer();
const promiseGetTestResults = _getTestResults();

describe("Setup test environment", function() {
  describe("Sideload and start test server", function() {
    it("should sideload and the server should be started", async function() {
      _sideloadCustomFunctions();
      await promiseStartServer;
      assert.strictEqual(serverStarted, true)
    });
  });
});

describe("Test Excel Custom Functions", function() {
  describe("Get test results for custom functions and validate results", function() {    
    it("should get results from the taskpane application", async function() {
      await promiseGetTestResults;
      assert.equal(cfValues[0].length, 5);
    });
    it("ADD function should return expected value", async function() {
      assert.equal(7, cfValues[0][0].cfValue);
    });
    it("CLOCK function should return expected value", async function() {
      // see if returned string contains 'AM' or 'PM'
      assert.equal(true, cfValues[0][1].cfValue.includes("AM") || cfValues[0][1].cfValue.includes("PM") ? true : false);
    });
    it("INCREMENT function should return expected value", async function() {
      // Check to see that both captured streaming values are numbers
      assert.equal(false, isNaN(cfValues[0][2].cfValue));
      assert.equal(false, isNaN(cfValues[0][3].cfValue));

      // Check to see that both captured streaming values are divisible by 4
      assert.equal(0, cfValues[0][2].cfValue % 4);
      assert.equal(0, cfValues[0][3].cfValue % 4);
    });
    it("LOG function should return expected value", async function() {
      assert.equal("this is a test", cfValues[0][4].cfValue);
    });
  });
});

describe("Teardown test environment", function() {
  describe("Kill Excel and the test server", function() {
    it("should close Excel and stop the test server", async function() {
      _teardownTestEnvironment();
    });
  });
});

async function _startTestServer() {
  return new Promise(async function(resolve) {
    const key = fs.readFileSync('certs/server.key');
    const cert = fs.readFileSync('certs/server.crt');
    const options = { key: key, cert: cert };

    app.get('/ping', function(req, res) {
        res.send('200');
        serverStarted = true;
        resolve();
      });
   
    const https = require('https');
    server = https.createServer(options,app);
      
    // listen for new web clients:
    server.listen(8080, function() {
      console.log("Test Server started");
    });
});
}

function _sideloadCustomFunctions() {
  const cmdLine = "npm run start-desktop";
  shell.exec(cmdLine, {silent: true});
}

async function _getTestResults() {
  return new Promise(async function(resolve) {
    app.get('/results', function(req,res) {
      res.send('200');
      cfValues.push(JSON.parse(req.query.data));
      resolve(cfValues);
      console.log("Shutting down test server");
      server.close();
    });
});
}

async function _sideloadCustomFunctions() {
  const cmdLine = "npm run start-desktop";
  exec(cmdLine, {windowsHide: true});
}

async function _teardownTestEnvironment() {
  const cmdLine = "tskill excel";
  exec(cmdLine, {windowsHide: true});
}

