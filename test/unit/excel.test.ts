import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, require, test */

const ExcelMockData = {
  context: {
    workbook: {
      range: {
        address: "G4",
        format: {
          fill: {},
        },
      },
      getSelectedRange: function () {
        return this.range;
      },
    },
  },
  run: async function (callback) {
    await callback(this.context);
  },
};

const OfficeMockData = {
  onReady: async function () {},
};

test(`Excel`, async function () {
  const excelMock: OfficeMockObject = new OfficeMockObject(ExcelMockData);
  global.Excel = excelMock as any;
  global.Office = new OfficeMockObject(OfficeMockData) as any;

  const { run } = require("../../src/taskpane/excel");
  await run();

  expect(excelMock.context.workbook.range.format.fill.color).toBe("yellow");
});
