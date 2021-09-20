import * as assert from "assert";
import { OfficeMockObject } from "office-addin-mock";
import { getSelectedRangeAddress } from "../src/src-file";

const MockData = {
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
    const contextMock = new OfficeMockObject(MockData) as any;

    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });
});
