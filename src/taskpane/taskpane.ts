/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
const testFunctions = ['=CONTOSO.ADD(5,2)', '=CONTOSO.CLOCK()', '=CONTOSO.INCREMENT(4)', '=CONTOSO.LOG("this is a test")'];
let cfValues = [];

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();

  // If a test server is running, then run Custom Functions tests on initialize of taskpane
  isTtestServerStarted(); 
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

async function runCfTests() {  
  await Excel.run(async context => {
    for (let i = 0; i < testFunctions.length; i++) {
      const range = context.workbook.getSelectedRange();
      const formula : string = testFunctions[i]
      range.formulas = [[formula]];
      await context.sync();
      await sleep(2000);

      // Check to if this is a streaming function
      await readData(formula.indexOf("INCREMENT") > 0)
    }
  });
  sendData(cfValues);
}

async function readData(isStreamingFunction: boolean) {
  await Excel.run(async context => {

    // if this is a streaming function, we want to capture two values so we can
    // validate the function is indeed streaming
    for (let i = 0; isStreamingFunction ?  i <= 1 : i < 1; i++)
    {
      const range = context.workbook.getSelectedRange();
      range.load("values");
      await context.sync();
  
      var data = {"cfValue": range.values[0][0]};
      cfValues.push(data);
    }
  });
}

async function sendData(values)
{
  //make cfValues a json blob that we can pass in single request to test server
  var json = JSON.stringify(values);  
    
  const Http = new XMLHttpRequest();
  const url: string =`https://localhost:8080/`;
  let dataUrl : string = url + "results/?data=" + encodeURIComponent(json);
  Http.open("GET", dataUrl, true);  
  Http.setRequestHeader('Content-type','application/json; charset=utf-8');
  Http.send();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTtestServerStarted() {
  const Http = new XMLHttpRequest();
  const pingUrl : string = `https://localhost:8080/ping`;
  Http.onreadystatechange=(e)=> {    
    if (Http.readyState === 4 && Http.status === 200) {
      runCfTests();
    }
  }
  Http.open("GET", pingUrl, true);
  Http.send();
}
