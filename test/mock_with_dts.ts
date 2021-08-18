// /// <reference path="../node_modules/@types/office-js/index.d.ts" />

// import { Excel } from "@microsoft/office-js/dist/index-test";

// import * as sinon from "sinon";
// import { run } from "../src/test-file";

// import * as assert from "assert";

// let testvar: Excel.RangeAreas;

// async function getSelectedRangeAddress(context: Excel.RequestContext): Promise<string> {
//   const range: Excel.Range = context.workbook.getSelectedRange();

//   range.load("address");
//   await context.sync();

//   return range.address;
// }

// /* global before, it, global */

// // eslint-disable-next-line no-undef
// describe(`Test Task Pane Project mocking`, function () {
//   before("Setup global variable", function () {
//     global.Excel = Excel;
//   });
//   it("Validate mock using .d.ts file", async function () {
//     const runSpy = sinon.spy(Excel, "run");
//     await run();
//     assert(runSpy.calledOnce);
//   });
// });
