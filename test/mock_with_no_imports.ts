import * as assert from "assert";

import { getSelectedRangeAddressOtherFile } from "../src/test-file";

/* global describe, it */

class RangeMock {
  constructor(address: string) {
    this.loaded = false;
    this.address = "error, address was not loaded";
    this.addressBeforeLoad = address;
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

describe(`Test Task Pane Project mocking without imports`, function () {
  it("Validate mock without imports for a function in another file", async function () {
    const context = new ContextMock("C2") as any;
    assert.strictEqual(await getSelectedRangeAddressOtherFile(context), "C2");
  });
});
