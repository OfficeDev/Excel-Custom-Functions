import { OfficeMockObject } from "office-addin-mock";
import { run } from "../../src/taskpane/powerpoint";

/* global expect, global, test */

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
  const officeMock = new OfficeMockObject(PowerPointMockData) as any;
  global.Office = officeMock;

  await run();

  expect(officeMock.context.document.data).toBe("Hello World!");
});
