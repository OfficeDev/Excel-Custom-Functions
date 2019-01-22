import * as helperMethods from './testHelperMethods';
import * as fs from "fs";
const assert = require('assert');
let cfValues = [];
const promiseSetupTestEnvironment = helperMethods.setupTestEnvironment();
const promiseStartTestServer = helperMethods.startTestServer();
const promiseGetTestResults = helperMethods.getTestResults();
const functionsJsonFile: string = `${__dirname}/functionsTestData.json`;
const functionsJsonData = JSON.parse(fs.readFileSync(functionsJsonFile).toString());

describe("Setup test environment", function() {
  describe("Start sideload, start dev-server, and start test-server", function() {
    it("Sideload should have completed and dev-server should have started", async function() {
      const setupTestEnvironmentSucceeded = await promiseSetupTestEnvironment;
      assert.equal(setupTestEnvironmentSucceeded, true);
    });
    it("Test server should have started and Excel should have pinged the server", async function() {
      const testServerStarted = await promiseStartTestServer;
      assert.equal(testServerStarted, true);
    });
  });
});

describe("Test Excel Custom Functions", function() {
  describe("Get test results for custom functions and validate results", function() {    
    it("should get results from the taskpane application", async function() {
      cfValues = await promiseGetTestResults;
      // Expecting five result values
      assert.equal(cfValues.length, 6);
    });
    it("ADD function should return expected value", async function() {
      assert.equal(functionsJsonData.functions.ADD.result, cfValues[0].Value);
    });
    it("CLOCK function should return expected value", async function() {
      // Check that captured values are different to ensure the function is streaming
      assert.notEqual(cfValues[1].Value, cfValues[2].Value);
      // Check if the returned string contains 'AM' or 'PM', indicating it's a time-stamp
      assert.equal(true, cfValues[1].Value.includes(functionsJsonData.functions.CLOCK.result.amString) || cfValues[1].Value.includes(functionsJsonData.functions.CLOCK.result.pmString) ? true : false);
      assert.equal(true, cfValues[2].Value.includes(functionsJsonData.functions.CLOCK.result.amString) || cfValues[2].Value.includes(functionsJsonData.functions.CLOCK.result.pmString) ? true : false);
    });
    it("INCREMENT function should return expected value", async function() {
      // Check that captured values are different to ensure the function is streaming
      assert.notEqual(cfValues[3].Value, cfValues[4].Value);
      // Check to see that both captured streaming values are divisible by 4
      assert.equal(0, cfValues[3].Value % functionsJsonData.functions.INCREMENT.result);
      assert.equal(0, cfValues[4].Value % functionsJsonData.functions.INCREMENT.result);
    });
    it("LOG function should return expected value", async function() {
      assert.equal(functionsJsonData.functions.LOG.result, cfValues[5].Value);
    });
  });
});

describe("Teardown test environment", function() {
    describe("Kill Excel and the test server", function() {
      it("should close Excel and stop the test server", async function() {
        await helperMethods.teardownTestEnvironment(process.platform == 'win32' ? "EXCEL" : "Excel");
      });
    });
  });

