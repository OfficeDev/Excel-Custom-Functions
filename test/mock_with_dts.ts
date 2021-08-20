// import * as sinon from "sinon";
// import * as assert from "assert";
// // /// <reference path="./index-test.ts" /> 
// import Excel from "./index-test"
// // import * as Excel from "../node_modules/@microsoft/office-js/dist/excel-15.js";

// console.log("Excel");

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

// // class C {
// //   constructor() {}
// //   method() {}
// // }
// // interface i {
// //   method: () => void;
// // }

// // function fc(_p: C) {}

// // function fi(_p: i) {}

// // const v = { method: () => {} };

// // fc(v);
// // fi({ method: () => {} });
