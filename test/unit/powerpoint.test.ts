import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, require, test */

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

test(`PowerPoint`, async function () {
  const officeMock: OfficeMockObject = new OfficeMockObject(PowerPointMockData);
  global.Office = officeMock as any;

  const { run } = require("../../src/taskpane/powerpoint");
  await run();

  expect(officeMock.context.document.data).toBe("Hello World!");
});
