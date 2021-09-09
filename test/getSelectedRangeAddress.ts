import * as assert from "assert";
import { OfficeJSMock } from "./mock_utils";
import { getSelectedRangeAddress } from "../src/test-file";
const JsonData = require("./getSelectedRangeAddress.json");

/* global describe, it, require */

describe(`getSelectedRangeAddress`, function () {
  it("Using json", async function () {
    const contextMock = new OfficeJSMock("context") as any;
    contextMock.populate(JsonData);

    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });
});
