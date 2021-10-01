import * as assert from "assert";
import { OfficeMockObject } from "office-addin-mock";
import { run, runOnReady } from "../../src/taskpane/powerpoint";

/* global describe, global, it */

const PowerPointMockData = {
  context: {
    document: {
      setSelectedDataAsync: function (data: string, options?) {
        this.data = data;
        this.options = options;
      },
    },
  },
  CoercionType: {
    Text: {},
  },
};

describe(`PowerPoint`, function () {
  it("Run", async function () {
    const officeMock = new OfficeMockObject(PowerPointMockData) as any;
    global.Office = officeMock;

    await run();

    assert.strictEqual(officeMock.context.document.data, "Hello World!");
  });
  it("runOnReady", async function () {
    // Test code for the runOnReady function
    runOnReady();
  });
});
