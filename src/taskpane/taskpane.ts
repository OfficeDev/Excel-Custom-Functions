/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
const httpRequest = require('xmlhttprequest').XMLHttpRequest;
const testFunctions = ['=CONTOSO.ADD(1,2)', '=CONTOSO.CLOCK()', '=CONTOSO.INCREMENT(2)', '=CONTOSO.LOG("this is a test")'];
let cfValues = [];

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();

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
  try {
    await Excel.run(async context => {
      for (let i = 0; i < testFunctions.length; i++) {
        const range = context.workbook.getSelectedRange();
        range.formulas = [[testFunctions[i]]];
        await context.sync();
        await sleep(2000);
        await readData()
      }
    });
    sendData(cfValues);
  } catch (error) {
    OfficeHelpers.UI.notify(error);
    OfficeHelpers.Utilities.log(error);
  }
}

async function readData() {
  await Excel.run(async context => {

    const range = context.workbook.getSelectedRange();
    range.load("values");
    await context.sync();

    var data = {"cfValue": range.values[0][0]};
    cfValues.push(data);
  });
}

async function sendData(values)
{
  //make cfValues a json blob that we can pass in single request to test server
  var json = JSON.stringify(values);  
    
  const Http = new httpRequest();
  const url=`https://localhost:8080/`;
  let postUrl = url + "results/?data=" + encodeURIComponent(json);
  Http.open("GET", postUrl, true);  
  Http.setRequestHeader('Content-type','application/json; charset=utf-8');
  Http.send();
  Http.onreadystatechange=(e)=> {
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTtestServerStarted() {
  const Http = new httpRequest();
  const pingUrl = `https://localhost:8080/ping`;
  Http.onreadystatechange=(e)=> {    
    if (Http.readyState === 4 && Http.status === 200) {
      runCfTests();
    }
  }
  Http.open("GET", pingUrl, true);
  Http.send("ping");
}
