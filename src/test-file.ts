/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */


export async function getSelectedRangeAddressOtherFile(context: Excel.RequestContext): Promise<string> {
  const range: Excel.Range = context.workbook.getSelectedRange();

  range.load("address");
  await context.sync();

  return range.address;
}
