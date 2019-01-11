/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
const httpRequest = require('xmlhttprequest').XMLHttpRequest;
const testFunctions = ['=CONTOSO.ADD(1,2)', '=CONTOSO.CLOCK()', '=CONTOSO.INCREMENT(2)'];
let cfValues = [];

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();
};

async function run() {

  await runCfTests();
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

    cfValues.push(range.values[0][0]);
  });
}

async function sendData(value)
{
  var data = {"cfValue": value};
  var json = JSON.stringify(data);
    
  const Http = new httpRequest();
  const url=`https://localhost:8080`;
  let postUrl = url + "?data=" + encodeURIComponent(json);
  Http.open("GET", postUrl, true);  
  Http.setRequestHeader('Content-type','application/json; charset=utf-8');
  Http.send();
  Http.onreadystatechange=(e)=> {
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testServerStarted() {
  const Http = new httpRequest();
  const url = `https://localhost:8080`;
  const testServerUrl = url + "?data=" + encodeURIComponent("ping");
  Http.open("GET", testServerUrl, true);   
  Http.send("ping");
  Http.onreadystatechange=(e)=> {
    if (Http.responseText == '200') {
      return true;
    }
  }
  return true  ;
}