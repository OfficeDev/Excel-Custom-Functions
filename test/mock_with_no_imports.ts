import * as assert from "assert";

import { ContextMock, ExcelMock } from "./mock_utils";
import { getSelectedRangeAddressOtherFile, run } from "../src/test-file";

/* global describe, global, it */

describe(`Test Task Pane Project mocking without imports`, function () {
  it("getSelectedRangeAddressOtherFile", async function () {
    const context = new ContextMock("C2") as any;
    assert.strictEqual(await getSelectedRangeAddressOtherFile(context), "C2");
  });
  it("run", async function () {
    global.Excel = new ExcelMock() as any;
    await run();
  });
});
