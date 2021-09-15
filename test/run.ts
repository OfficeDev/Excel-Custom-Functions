import * as assert from "assert";
import { OfficeJSMock } from "office-addin-unit-test";
import { run } from "../src/src-file";
const JsonData = {
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

/* global describe, global, it */

describe(`Run`, function () {
  it("Using json", async function () {
    const excelMock = new OfficeJSMock(JsonData) as any;
    excelMock.addMockFunction("run", async function (callback) {
      await callback(excelMock.context);
    });
    global.Excel = excelMock;

    await run();

    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
});
