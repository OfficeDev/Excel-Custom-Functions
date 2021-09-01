import * as assert from "assert";
import * as sinon from "sinon";

import { ContextMock, ExcelMock, OfficeJSMock } from "./mock_utils";
import { getSelectedRangeAddress, run } from "../src/test-file";

/* global describe, global, it */

describe(`Test Task Pane Project mocking without imports`, function () {
  it("getSelectedRangeAddress", async function () {
    // const context = new ContextMock() as any;
    // context.workbook.range.setMock("address", "C2");
    const context = new OfficeJSMock("context") as any;
    context.addMockObject("workbook");

    context.workbook.addMockObject("range");
    
    context.workbook.addMockFunction("getSelectedRange");
    sinon.stub(context.workbook, "getSelectedRange").callsFake(() => context.workbook.range);

    context.workbook.range.setMock("address", "C3");
    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
  });
  // it("run", async function () {
  //   global.Excel = new ExcelMock() as any;
  //   await run();
  //   assert.strictEqual((global.Excel as any).context.workbook.range.format.fill.color, "yellow");
  // });
});
