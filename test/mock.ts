/// <reference path="../node_modules/@types/office-js/index.d.ts" />

import * as sinon from 'sinon';
import { Office, Excel, OfficeExtension } from '@microsoft/office-js/dist/excel.js';
// eslint-disable-next-line no-undef
global.Excel = Excel;
// eslint-disable-next-line no-undef
global.OfficeExtension = OfficeExtension;

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
  it("Validate mockt, async function()", async function () {
    const context: Excel.RequestContext = new Excel.RequestContext();
    const range: Excel.Range = context.workbook.getSelectedRange();

    range.setMockData({
      address: "C2",
    });
    sinon.stub(context.workbook, "getSelectedRange").callsFake(() => range);

    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
  });
});
