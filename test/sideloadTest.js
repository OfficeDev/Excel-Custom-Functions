const fs = require('fs');
const shell = require('shelljs');
const assert = require('assert');
let cfValue;
let server;

describe("Sideload", function() {
    describe("Sideload", function() {
      it("should sideload and run custom function", async function() {
        await startServer();
        await _sideloadCustomFunctions();        
      });
    });
  });

async function startServer() {
  const hskey = fs.readFileSync('certs/server.key');
  const hscert = fs.readFileSync('certs/server.crt');
  const options = { key: hskey, cert: hscert };
  const express = require('express');
  const app = express();
  app.get('/', function(req,res) {
      res.send('200');
      cfValue = JSON.parse(req.query.data).cfValue;
      assert.equal(3, cfValue);
    });
    
  const https = require('https');
  server = https.createServer(options,app);
    
  // listen for new web clients:
  server.listen(8080, function() {
    console.log("Received request");
  });
}

async function _sideloadCustomFunctions() {
  const cmdLine = "npm run start-desktop";
  shell.exec(cmdLine, {silent: true});
}
