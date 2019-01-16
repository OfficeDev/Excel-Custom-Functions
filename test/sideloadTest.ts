import * as helperMethods from './testHelperMethods';
const assert = require('assert');
let cfValues = [];
const promiseSetupTestEnvironment = helperMethods.setupTestEnvironment();
const promiseStartTestServer = helperMethods.startTestServer();
const promiseGetTestResults = helperMethods.getTestResults();

describe("Setup test environment", function() {
  describe("Sideload and start test server", function() {
    it("should sideload and the server should be started", async function() {
      const setupTestEnvironmentSucceeded = await promiseSetupTestEnvironment;
      const testServerStarted = await promiseStartTestServer;
      assert.strictEqual(setupTestEnvironmentSucceeded, true);
      assert.strictEqual(testServerStarted, true)
    });
  });
});

describe("Test Excel Custom Functions", function() {
  describe("Get test results for custom functions and validate results", function() {    
    it("should get results from the taskpane application", async function() {
      cfValues = await promiseGetTestResults;
      // Expecting five result values
      assert.equal(cfValues[0].length, 5);
    });
    it("ADD function should return expected value", async function() {
      assert.equal(7, cfValues[0][0].cfValue);
    });
    it("CLOCK function should return expected value", async function() {
      // Check if the returned string contains 'AM' or 'PM', indicating it's a time-stamp
      assert.equal(true, cfValues[0][1].cfValue.includes("AM") || cfValues[0][1].cfValue.includes("PM") ? true : false);
    });
    it("INCREMENT function should return expected value", async function() {
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
      helperMethods.teardownTestEnvironment();
    });
  });
});