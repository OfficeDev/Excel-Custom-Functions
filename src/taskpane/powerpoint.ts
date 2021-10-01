/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office */

export function runOnReady(): void {
  // Put here your addin code that will run when the Office documents starts.
}

export async function run() {
  /**
   * Insert your PowerPoint code here
   */
  const options: Office.SetSelectedDataOptions = { coercionType: Office.CoercionType.Text };

  await Office.context.document.setSelectedDataAsync(" ", options);
  await Office.context.document.setSelectedDataAsync("Hello World!", options);
}
