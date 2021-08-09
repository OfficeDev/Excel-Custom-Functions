/// <reference path="../node_modules/@types/office-js/index.d.ts" />

import * as sinon from "sinon";
import { Excel, OfficeExtension } from "@microsoft/office-js/dist/excel.js";

OfficeExtension.TestUtility.setMock(true);

import * as assert from "assert";

async function getSelectedRangeAddress(context: Excel.RequestContext): Promise<string> {
  const range: Excel.Range = context.workbook.getSelectedRange();

  range.load("address");
  await context.sync();

  return range.address;
}

// eslint-disable-next-line no-undef
describe(`Test Task Pane Project mocking`, function () {
  // eslint-disable-next-line no-undef
  it("Validate mock", async function () {
    const context: Excel.RequestContext = new Excel.RequestContext();
    const range: Excel.Range = context.workbook.getSelectedRange();

    range.setMockData({
      address: "C2",
    });
    sinon.stub(context.workbook, "getSelectedRange").callsFake(() => range);

    const contextSyncSpy = sinon.spy(context, "sync");
    const loadSpy = sinon.spy(range, "load");

    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
    assert(contextSyncSpy.calledOnce);
    assert(loadSpy.withArgs("address").calledOnce);
  });
});
