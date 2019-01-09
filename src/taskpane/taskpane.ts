/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
import * as fs from 'fs';
let cfValues;

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();
  await run();
  await saveFile(cfValues);
};

async function run() {
  try {
    await Excel.run(async context => {
      /**
       * Insert your Excel code here
       */

      const range = context.workbook.getSelectedRange();
      range.formulas = [['=CONTOSO.ADD(1,2)']];
      range.load("values");

      await context.sync();

      cfValues = [[range.values[0],[0]]];
      
      // const sheet = context.workbook.worksheets.getActiveWorksheet();
      // const setRange =  sheet.getRange("B5");
      // setRange.values = [[cfValues]];

      // await context.sync();

      console.log(`The range address was ${range.values[0][0]}.`);
    });
  } catch (error) {
    OfficeHelpers.UI.notify(error);
    OfficeHelpers.Utilities.log(error);
}
}

async function saveFile(value)
{
  const tempDir = process.env.TEMP;
  const defaultRuntimeLogFileName = "CFValues.log";
  let path = `${tempDir}\\${defaultRuntimeLogFileName}`;

  const file = fs.openSync(path, "a+");

  fs.writeFile(path, value, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  fs.closeSync(file);
}
