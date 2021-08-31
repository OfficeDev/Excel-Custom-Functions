import * as sinon from "sinon";
import { Excel, OfficeExtension } from "@microsoft/office-js/dist/excel.js";
import { getSelectedRangeAddressOtherFile } from "../src/test-file";

OfficeExtension.TestUtility.setMock(true);

import * as assert from "assert";

async function getSelectedRangeAddress(context: Excel.RequestContext): Promise<string> {
  const range: Excel.Range = context.workbook.getSelectedRange();

  range.load("address");
  await context.sync();

  return range.address;
}

/* global before, it, global */

// eslint-disable-next-line no-undef
describe(`Test Task Pane Project mocking`, function () {
  before("Setup global variable", function () {
    global.Excel = Excel;
  });
  it("Validate mock within same file using enlistment excel", async function () {
    const context: Excel.RequestContext = new Excel.RequestContext();
    const range: Excel.Range = context.workbook.getSelectedRange();

    range.setMockData({
      address: "C2",
    });
    sinon.stub(context.workbook, "getSelectedRange").callsFake(() => range);

    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
  });
  it("Validate mock within different file using enlistment excel", async function () {
    const context: Excel.RequestContext = new Excel.RequestContext();
    const range: Excel.Range = context.workbook.getSelectedRange();
    range.setMockData({
      address: "C2",
    });
    sinon.stub(context.workbook, "getSelectedRange").callsFake(() => range);

    assert.strictEqual(await getSelectedRangeAddressOtherFile(context), "C2");
  });
});
