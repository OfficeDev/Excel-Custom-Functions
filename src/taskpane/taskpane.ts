/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from "@microsoft/office-js-helpers";
import * as fs from 'fs';
import * as http from 'http';
const httpRequest = require('xmlhttprequest').XMLHttpRequest;
// import * as childProcess from "child_process";

$(document).ready(() => {
  $("#run").click(run);
});

// The initialize function must be run each time a new page is loaded
Office.initialize = async () => {
  $("#sideload-msg").hide();
  $("#app-body").show();
  await run();
};

async function run() {
  try {
    await Excel.run(async context => {
      const range = context.workbook.getSelectedRange();
      range.formulas = [['=CONTOSO.ADD(1,2)']];
      await context.sync();
    });
  } catch (error) {
    OfficeHelpers.UI.notify(error);
    OfficeHelpers.Utilities.log(error);
}
await sleep(2000);
await readData()
}

async function readData() {
  await Excel.run(async context => {

    const range = context.workbook.getSelectedRange();
    range.load("values");
    await context.sync();

    var cfValue = range.values[0][0];
    await sendData(cfValue);
  });
}

async function saveFile(value)
{
  const tempDir = process.env.TEMP;
  const defaultRuntimeLogFileName = "CFValue.log";
  let path = `${tempDir}\\${defaultRuntimeLogFileName}`;

  const file = fs.openSync(path, "a+");

  fs.writeFile(path, value, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  fs.closeSync(file);
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
  // Http.open("GET", testUrl, true);  
  Http.send();
  Http.onreadystatechange=(e)=> {
    console.log(Http.responseText)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}