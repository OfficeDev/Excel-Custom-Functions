import * as assert from "assert";
import "mocha";
import { OfficeMockObject } from "office-addin-mock";

/* global describe, global, it, require */

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
  run: async function (callback: (context: any) => Promise<void> | void) {
    await callback(this.context);
  },
};

const OfficeMockData = {
  onReady: async function () {},
};

describe("Excel", function () {
  it("Run", async function () {
    const excelMock: OfficeMockObject = new OfficeMockObject(ExcelMockData); // Mocking the host specific namespace
    (global as any).Excel = excelMock;
    (global as any).Office = new OfficeMockObject(OfficeMockData); // Mocking the common office-js namespace

    const { run } = require("../../src/taskpane/taskpane");
    await run();

    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
});
