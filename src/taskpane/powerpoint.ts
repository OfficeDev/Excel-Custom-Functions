/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Office */

Office.onReady(info => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  /**
   * Insert your PowerPoint code here
   */
  Office.context.document.setSelectedDataAsync(
    "Hello World!",
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
