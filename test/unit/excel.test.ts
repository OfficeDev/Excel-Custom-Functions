import { OfficeMockObject } from "office-addin-mock";
import { run } from "../../src/taskpane/excel";

/* global expect, global, test */

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
};

test(`Excel`, async function () {
  const excelMock = new OfficeMockObject(ExcelMockData) as any;
  excelMock.addMockFunction("run", async function (callback) {
    await callback(excelMock.context);
  });
  global.Excel = excelMock;

  await run();

  expect(excelMock.context.workbook.range.format.fill.color).toBe("yellow");
});
