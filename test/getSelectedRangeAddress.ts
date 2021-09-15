import * as assert from "assert";
import { OfficeJSMock } from "office-addin-unit-test";
import { getSelectedRangeAddress } from "../src/src-file";

const JsonData = {
  workbook: {
    range: {
      address: "C2",
    },
    getSelectedRange: function () {
      return this.range;
    },
  },
};

/* global describe, it */

describe(`getSelectedRangeAddress`, function () {
  it("Using json", async function () {
    const contextMock = new OfficeJSMock(JsonData) as any;
    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });
});
