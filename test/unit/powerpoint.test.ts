import { OfficeMockObject } from "office-addin-mock";

/* global expect, jest, require, test */

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

test(`PowerPoint`, async function () {
  jest.resetModules(); // to make sure that require will return a new module instance
  const officeMock: OfficeMockObject = new OfficeMockObject(PowerPointMockData);
  officeMock.addMockFunction("onReady");
  jest.mock("./../../src/taskpane/office", () => officeMock);

  const { run } = require("../../src/taskpane/powerpoint");
  await run();

  expect(officeMock.context.document.data).toBe("Hello World!");
});
