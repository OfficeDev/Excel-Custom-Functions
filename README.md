# Custom functions in Excel (preview)

Custom functions enable you to add new functions to Excel by defining those functions in JavaScript as part of an add-in. Users within Excel can access custom functions just as they would any native function in Excel, such as `SUM()`. 

This repository contains a simple custom functions add-in project that you can use to learn about developing custom functions in Excel. You may also choose to use this project as a basis for creating your own custom functions project. For more detailed information about custom functions in Excel, see the [Custom functions overview](https://docs.microsoft.com/office/dev/add-ins/excel/custom-functions-overview) article in the Office Add-ins documentation.

## Table of Contents

* [Change history](#change-history)
* [Prerequisites](#prerequisites)
* [Using this project](#using-this-project)
* [Making changes](#making-changes)
* [Debugging](#debugging)
* [Questions and comments](#questions-and-comments)
* [Additional resources](#additional-resources)

## Change history

* Oct 27, 2017: Initial version.
* April 23, 2018: Revised and expanded.
* June 1, 2018: Bug fixes.

## Prerequisites

* Install Office 2016 for Windows (build number 10827 or later)
* Join the [Office Insider](https://products.office.com/office-insider) program

## Using this project

On a machine with a valid instance of an Excel Insider build installed, follow these instructions to use this custom functions sample add-in:

1. On the machine where your custom functions add-in project is installed, [install the self-signed certificates](https://github.com/OfficeDev/generator-office/blob/master/src/docs/ssl.md).

2. At a command prompt from within your custom functions project directory, run `npm start` to start a localhost server instance, launch Excel, and sideload the custom functions add-in. (For additional information about sideloading Office Add-ins, see [Sideload Office Add-ins for testing](https://aka.ms/sideload-addins).)

3. After Excel launches, register the custom functions add-in by completing the following steps:

    1. In Excel, choose the **Insert** tab and then choose the down-arrow that's located immediately to the right of **My Add-ins**.

    1. In the list of available add-ins, find the **Developer Add-ins** section and select the **Excel Custom Functions** add-in to register it.

    **Note**: The [Custom functions tutorial](https://docs.microsoft.com/office/dev/add-ins/excel/excel-tutorial-custom-functions#try-out-a-prebuilt-custom-function) contains screenshots that highlight these UI elements.

4. In Excel, test a custom function within the sample project by entering the value `=CONTOSO.ADD(10, 200)` in a cell. The `ADD` custom function computes the sum of the two numbers that you specify as input parameters, so the calculated result should be **210**.

5. In Excel, test another custom function within the sample project by entering `=CONTOSO.INCREMENT(2)`. The `INCREMENT` custom function is a streaming custom function that periodically increments the cell value by the amount that you specify as an input parameter.

6. If you make changes to the sample add-in project, copy the updated files to your website, and then close Excel and reopen Excel. After you reopen Excel, reregister the add-in by repeating the instructions specified in preceding step #3.

## Making changes

If you make changes to the sample functions code (in the JavaScript file or TypeScript file), close Excel and reopen Excel to test them. After you reopen Excel, reregister the add-in by repeating the instructions specified in step #3 of the preceding section.

If you change the custom functions metadata (in the JSON file), close Excel and delete your cache folder `Users/<user>/AppData/Local/Microsoft/Office/16.0/Wef/CustomFunctions`. Then reopen Excel and reregister the add-in by repeating the instructions specified in step #3 of the preceding section.

## Debugging

Information about best practices for debugging custom functions can be found in [Custom functions best practices](https://docs.microsoft.com/office/dev/add-ins/excel/custom-functions-best-practices#debugging).

## Questions and comments

We'd love to get your feedback about this sample. You can send your feedback to us in the *Issues* section of this repository.

Questions about Office Add-ins development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/office-js) and tagged with **[office-js]**.

## Additional resources

* [Custom functions overview](https://docs.microsoft.com/office/dev/add-ins/excel/custom-functions-overview)
* [Custom functions best practices](https://docs.microsoft.com/office/dev/add-ins/excel/custom-functions-best-practices)
* [Custom functions runtime](https://docs.microsoft.com/office/dev/add-ins/excel/custom-functions-runtime) 
* [Custom functions tutorial](https://docs.microsoft.com/office/dev/add-ins/excel/excel-tutorial-custom-functions)
* [Office Add-ins documentation](https://docs.microsoft.com/office/dev/add-ins/overview/office-add-ins)
* [OfficeDev on GitHub](https://github.com/officedev?q=add-in) (for more Office Add-in samples)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Copyright
Copyright (c) 2017 Microsoft Corporation. All rights reserved.
