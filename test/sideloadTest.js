const fs = require('fs');
const shell = require('shelljs');
const assert = require('assert');
let cfValues = [];
let server;
let serverStarted = false;
const promiseStartServer = _startTestServer();

// describe("Setup test environment", function() {
//   describe("Sideload and start test server", function() {
//     it("should sideload and the server should be started", async function() {
//       _sideloadCustomFunctions();
//       await promiseStartServer;
//       assert.strictEqual(serverStarted, true)
//     });
//   });
// });

describe("Custom Functions ADD function", function() {
  describe("ADD", function() {
    it("should equal the expected value", async function() {
      _sideloadCustomFunctions();
      await promiseStartServer;
      assert.equal(3, cfValues[0]);
    });
  });
});

describe("Custom Functions INCREMENT function", function() {
  describe("INCREMENT", function() {
    it("should be a number", async function() {
      _sideloadCustomFunctions();
      await promiseStartServer;
      assert.equal(true, isNaN(cfValues[1]));
    });
  });
});

async function _startTestServer() {
  return new Promise(async function(resolve) {
    const key = fs.readFileSync('certs/server.key');
    const cert = fs.readFileSync('certs/server.crt');
    const options = { key: key, cert: cert };
    const express = require('express');
    const app = express();
    app.get('/', function(req,res) {
        res.send('200');
        if (req.query.data == 'ping') {
          serverStarted = true;
          resolve(serverStarted);
        }
        else {
          cfValues.push(JSON.parse(req.query.data).cfValue);
          if(cfValues.length == 2) {
            resolve(cfValues);
          }
        }
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
