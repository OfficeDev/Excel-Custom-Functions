/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

Office.onReady(info => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
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
