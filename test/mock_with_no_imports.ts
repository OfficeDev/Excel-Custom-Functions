import * as assert from "assert";
import { resolve } from "path";
import { stringify } from "querystring";

import { getSelectedRangeAddressOtherFile, run } from "../src/test-file";

/* global describe, global, it */

class FillMock {
  color: string;
}

class FormatMock {
  constructor() {
    this.fill = new FillMock();
  }
  fill: FillMock;
}

class RangeMock {
  constructor(address: string) {
    this.loaded = false;
    this.address = "error, address was not loaded";
    this.addressBeforeLoad = address;
    this.format = new FormatMock();
  }
  load() {
    this.loaded = true;
    this.address = "error, context.sync was not called";
  }
  sync() {
    if (this.loaded) {
      this.address = this.addressBeforeLoad;
    }
  }
  address: string;
  addressBeforeLoad: string;
  loaded: boolean;
  format: FormatMock;
}

class WorkbookMock {
  constructor(address: string) {
    this.range = new RangeMock(address);
  }
  getSelectedRange(): RangeMock {
    return this.range;
  }
  sync(): void {
    this.range.sync();
  }
  range: RangeMock;
}

class ContextMock {
  constructor(address: string) {
    this.workbook = new WorkbookMock(address);
  }
  async sync(): Promise<void> {
    this.workbook.sync();
  }
  workbook: WorkbookMock;
}

class ExcelMock {
  async run(callback): Promise<void> {
    const context = new ContextMock("G5");
    await callback(context);
  }
}

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
