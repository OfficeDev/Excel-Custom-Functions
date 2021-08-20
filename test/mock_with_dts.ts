import * as sinon from "sinon";
import * as assert from "assert";

import { Range, RequestContext } from "../src/batch-interfaces";
import { getSelectedRangeAddressOtherFile } from "../src/test-file";

/* global beforeEach, describe, Excel, it */

async function getSelectedRangeAddress(context: RequestContext): Promise<string> {
  const range: Range = context.workbook.getSelectedRange();

  range.load("address");
  await context.sync();

  return range.address;
}

let context: RequestContext;

describe(`Test Task Pane Project mocking`, function () {
  beforeEach(`Creating context mock`, function () {
    context = {
      workbook: {
        getSelectedRange: () => {
          return {
            address: "C2",
            load: () => {},
          } as Range;
        }
      },
      sync: async () => {},
    };
  });
  it("Validate mock using .d.ts file", async function () {
    const contextSyncSpy = sinon.spy(context, "sync");

    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
    assert(contextSyncSpy.calledOnce);
  });
  it("Validate mock using .d.ts file for a function in another file", async function () {
    const contextSyncSpy = sinon.spy(context, "sync");

    assert.strictEqual(await getSelectedRangeAddressOtherFile(context as unknown as Excel.RequestContext), "C2");
    assert(contextSyncSpy.calledOnce);
  });
});
