import * as assert from "assert";

import { getSelectedRangeAddress } from "../src/test-file";

/* global describe, before, global, it */

let context;

describe(`Test Task Pane Project mocking without imports simple`, function () {
  before("Creating mock objects", async function () {
    context = {
      workbook: {
        getSelectedRange: function () {
          return {
            load: function () {
              return;
            },
            address: "C2",
          };
        },
      },
      sync: async function () {
        return;
      },
    };
  });
  it("getSelectedRangeAddressOtherFile", async function () {
    assert.strictEqual(await getSelectedRangeAddress(context), "C2");
  });
});
