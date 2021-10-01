import * as assert from "assert";
import { OfficeMockObject } from "office-addin-mock";
import { run, runOnReady } from "../../src/taskpane/excel";

/* global describe, global, it */

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

describe(`Excel`, function () {
  it("Run", async function () {
    const excelMock = new OfficeMockObject(ExcelMockData) as any;
    excelMock.addMockFunction("run", async function (callback) {
      await callback(excelMock.context);
    });
    global.Excel = excelMock;

    await run();

    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
  it("runOnReady", async function () {
    // Test code for the runOnReady function
    runOnReady();
  });
});
