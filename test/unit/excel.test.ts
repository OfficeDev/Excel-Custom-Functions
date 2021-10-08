import * as assert from "assert";
import "mocha";
import { OfficeMockObject } from "office-addin-mock";

/* global global, it, require */

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

// eslint-disable-next-line no-undef
describe("Excel", function () {
  it("Run", async function () {
    const excelMock: OfficeMockObject = new OfficeMockObject(ExcelMockData);
    global.Excel = excelMock as any;
    global.Office = new OfficeMockObject(OfficeMockData) as any;

    const { run } = require("../../src/taskpane/excel");
    await run();

    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
});
