/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = () => {
  $("#sideload-msg").hide();
  $("#app-body").show();
};

async function run() {
  switch (Office.context.host) {
    case Office.HostType.Excel:
      return runExcel();
    case Office.HostType.OneNote:
      return runOneNote();
    case Office.HostType.Outlook:
      return runOutlook();
    case Office.HostType.PowerPoint:
      return runPowerPoint();
    case Office.HostType.Project:
      return runProject();
    case Office.HostType.Word:
      return runWord();
  }
}

async function runExcel() {
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

async function runOneNote() {
  /**
   * Insert your OneNote code here
   */
}


async function runOutlook() {
  /**
   * Insert your Outlook code here
   */
}

async function runPowerPoint() {
  /**
   * Insert your PowerPoint code here
   */
  Office.context.document.setSelectedDataAsync("Hello World!",
    {
      coercionType: Office.CoercionType.Text
    },
    result => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        console.error(result.error.message);
      }
    }
  );
}

async function runProject() {
  /**
   * Insert your Outlook code here
   */
}

async function runWord() {
  return Word.run(async context => {
    /**
     * Insert your Word code here
     */
    const range = context.document.getSelection();

    // Read the range text
    range.load("text");

    // Update font color
    range.font.color = "red";

    await context.sync();
    console.log(`The selected text was ${range.text}.`);
  });
}
