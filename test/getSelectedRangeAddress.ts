import * as assert from "assert";
import * as sinon from "sinon";
import { OfficeJSMock } from "./mock_utils";
import { getSelectedRangeAddress } from "../src/test-file";

const JsonData = require("./getSelectedRangeAddress.json");

/* global describe, global, it */

describe(`getSelectedRangeAddress`, function () {
  it("Using json", async function () {
    const contextMock = new OfficeJSMock("context") as any;

    contextMock.populate(JsonData);
    contextMock.workbook.addMockFunction("getSelectedRange", () => contextMock.workbook.range);

    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });
  it("Basic test", async function () {
    const contextMock = new OfficeJSMock("context") as any;

    contextMock.addMockObject("workbook");
    contextMock.workbook.addMockObject("range");    
    contextMock.workbook.addMockFunction("getSelectedRange", () => contextMock.workbook.range);
    contextMock.workbook.range.setMock("address", "C2");

    assert.strictEqual(await getSelectedRangeAddress(contextMock), "C2");
  });});
