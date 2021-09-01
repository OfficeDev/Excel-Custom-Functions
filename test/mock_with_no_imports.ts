import * as assert from "assert";
import { OfficeJSMock } from "./mock_utils";
import { getSelectedRangeAddress, run } from "../src/test-file";

/* global describe, global, it */

describe(`Test Task Pane Project mocking without imports`, function () {
  it("getSelectedRangeAddress", async function () {
    const contextMock = new OfficeJSMock("context") as any;

    contextMock.addMockObject("workbook");
    contextMock.workbook.addMockObject("range");    
    contextMock.workbook.addMockFunction("getSelectedRange", () => contextMock.workbook.range);
    contextMock.workbook.range.setMock("address", "C2");

    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });
  it("run", async function () {
    const excelMock = new OfficeJSMock("excel") as any;

    excelMock.addMockObject("context");
    excelMock.context.addMockObject("workbook");
    excelMock.context.workbook.addMockObject("range");
    excelMock.context.workbook.addMockFunction("getSelectedRange", () => excelMock.context.workbook.range);
    excelMock.context.workbook.range.setMock("address", "G4");
    excelMock.context.workbook.range.addMockObject("format");
    excelMock.context.workbook.range.format.addMockObject("fill");
    excelMock.addMockFunction("run", async function(callback) {
      await callback(excelMock.context);
    });
  
    global.Excel = excelMock;
  
    await run();
    assert.strictEqual(excelMock.context.workbook.range.format.fill.color, "yellow");
  });
});
