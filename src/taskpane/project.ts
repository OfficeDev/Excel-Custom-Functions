/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Project) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  try {
    // Get the GUID of the selected task
    Office.context.document.getSelectedTaskAsync((result) => {
      let taskGuid;
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        taskGuid = result.value;

        // Set the specified fields for the selected task.
        const targetFields = [Office.ProjectTaskFields.Name, Office.ProjectTaskFields.Notes];
        const fieldValues = ["New task name", "Notes for the task."];

        // Set the field value. If the call is successful, set the next field.
        for (let index = 0; index < targetFields.length; index++) {
          Office.context.document.setTaskFieldAsync(taskGuid, targetFields[index], fieldValues[index], (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              index++;
            } else {
              console.log(result.error);
            }
          });
        }
      } else {
        console.log(result.error);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
