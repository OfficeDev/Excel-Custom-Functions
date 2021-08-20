import * as sinon from "sinon";
import * as assert from "assert";

import { getSelectedRangeAddressOtherFile } from "../src/test-file";

/* global beforeEach, describe, it */

let context;

describe(`Test Task Pane Project mocking without imports`, function () {
  beforeEach(`Creating context mock`, function () {
    context = {
      workbook: {
        getSelectedRange: () => {
          return {
            address: "C2",
            load: () => {},
          };
        }
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
