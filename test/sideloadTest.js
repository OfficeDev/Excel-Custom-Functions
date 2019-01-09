// import * as assert from "assert";
// import * as fs from 'fs';
const fs = require('fs');
const shell = require('shelljs');
const tempDir = process.env.TEMP;
const CFValueLog = "CFValue.log";
const path = `${tempDir}\\${CFValueLog}`;
const assert = require('assert');

describe("Sideload", function() {
    describe("Sideload", function() {
      it("should sideload and run custom function", async function() {
        await _sideloadCustomFunctions();
        const logValue = await _readLogFile();
        assert.strictEqual("3", logValue);
      });
    });
  });

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

