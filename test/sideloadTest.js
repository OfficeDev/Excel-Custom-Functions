const fs = require('fs');
const shell = require('shelljs');
const tempDir = process.env.TEMP;
const CFValueLog = "CFValue.log";
const path = `${tempDir}\\${CFValueLog}`;
const assert = require('assert');
const cors = require('cors')
let cfValue;

describe("Sideload", function() {
    describe("Sideload", function() {
      it("should sideload and run custom function", async function() {
        await startServer();
        await _sideloadCustomFunctions();
        assert.strictEqual(3, cfValue);
      });
    });
  });

async function startServer() {
  var express =  require('express');
  var app = express();
  app.use(cors());

  app.get('/', function(req,res) {
    res.send('200');
    cfValue = JSON.parse(req.query.data).cfValue;
  });
  
  app.listen(8080,function() {
    console.log("Received request");
  });
}

async function _sideloadCustomFunctions() {
    let cmdLine = "npm run start-desktop";
    shell.exec(cmdLine, {silent: true});
}

async function _readLogFile() {
  var content;
  fs.readFile(path, "utf8", function read(err, data) {
      if (err) {
          throw err;
      }
      content = data;
      return content;
  });
}

