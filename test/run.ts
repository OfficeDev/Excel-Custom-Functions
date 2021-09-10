import * as assert from "assert";
import { OfficeJSMock } from "office-addin-unit-test";
import { run } from "../src/test-file";
const JsonData = require("./run.json");

/* global describe, global, it, require */

describe(`Run`, function () {
  it("Using json", async function () {
    const excelMock = new OfficeJSMock() as any;
    excelMock.populate(JsonData);
    excelMock.addMockFunction("run", async function (callback) {
      await callback(excelMock.context);
    });
    global.Excel = excelMock;

    await run();

    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
});
