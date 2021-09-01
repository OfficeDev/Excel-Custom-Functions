import * as assert from "assert";
import { OfficeJSMock } from "./mock_utils";
import { getSelectedRangeAddress } from "../src/test-file";

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
});
