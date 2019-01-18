/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
import * as cfTests from './../../test/runCFTests'

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();

  // If a test server is running, then run Custom Functions tests on initialize of taskpane
  await isTestServerStarted();  
};

async function run() {
  try {
    await Excel.run(async context => {
      /**
       * Insert your Excel code here
       */
      const range = context.workbook.getSelectedRange();

      // Read the range address
      range.load("address");

      // Update the fill color
      range.format.fill.color = "yellow";

      await context.sync();
      console.log(`The range address was ${range.address}.`);
    });
  } catch (error) {
    OfficeHelpers.UI.notify(error);
    OfficeHelpers.Utilities.log(error);
  }
}

async function isTestServerStarted(): Promise<void> {
  const xhr = new XMLHttpRequest();
  const pingUrl : string = `https://localhost:8080/ping`;
  xhr.onreadystatechange=(e)=> {    
    if (xhr.readyState === 4 && xhr.status === 200) {
      cfTests.runCfTests(xhr.responseText);
    }
  }
  xhr.open("GET", pingUrl, true);
  xhr.send();
}
