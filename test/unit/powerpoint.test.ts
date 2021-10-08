import * as assert from "assert";
import "mocha";
import { OfficeMockObject } from "office-addin-mock";

/* global describe, global, it, require */

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
  onReady: async function () {},
};

describe("PowerPoint", function () {
  it("Run", async function () {
    const officeMock: OfficeMockObject = new OfficeMockObject(PowerPointMockData); // Mocking the common office-js namespace
    global.Office = officeMock as any;

    const { run } = require("../../src/taskpane/powerpoint");
    await run();

    assert.strictEqual(officeMock.context.document.data, "Hello World!");
  });
});
