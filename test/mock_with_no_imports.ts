import * as sinon from "sinon";
import * as assert from "assert";

import { getSelectedRangeAddressOtherFile } from "../src/test-file";

/* global beforeEach, describe, it */

let context;

class RangeMock {
  constructor(address: string) {
    this.loaded = false;
    this.address = "error, address was not loaded";
    this.addressBeforeLoad = address;
  }
  load() {
    this.address = this.addressBeforeLoad;
  }
  address: string;
  addressBeforeLoad: string;
  loaded: boolean;
}

describe(`Test Task Pane Project mocking without imports`, function () {
  beforeEach(`Creating context mock`, function () {
    context = {
      workbook: {
        getSelectedRange: () => new RangeMock("C2"),
      },
      sync: async () => {},
    };
  });
  it("Validate mock without imports for a function in another file", async function () {
    const contextSyncSpy = sinon.spy(context, "sync");

    assert.strictEqual(await getSelectedRangeAddressOtherFile(context), "C2");
    assert(contextSyncSpy.calledOnce);
  });
});
