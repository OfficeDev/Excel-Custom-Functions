/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console Excel, console */

export async function getSelectedRangeAddress(context: Excel.RequestContext): Promise<string> {
  const range: Excel.Range = context.workbook.getSelectedRange();

  range.load("address");
  await context.sync();

  return range.address;
}

export async function run() {
  try {
    await Excel.run(async (context) => {
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
    console.error(error);
  }
}
