import { OfficeMockObject } from "office-addin-mock";

/* global expect, global, jest, test */

namespace Office {
  export function onReady() {}
}
(global as any).Office = Office;

import { run } from "../../src/taskpane/excel";

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
  jest.resetModules(); // to make sure that require will return a new module instance

  const excelMock: OfficeMockObject = new OfficeMockObject(ExcelMockData);
  excelMock.addMockFunction("run", async function (callback) {
    await callback(excelMock.context);
  });
  global.Excel = excelMock as any;

  await run();

  expect(excelMock.context.workbook.range.format.fill.color).toBe("yellow");
});
