# Custom functions in Excel (Preview)

Custom functions (similar to user-defined functions, or UDFs) are JavaScript functions that you can add to Excel. This sample accompanies the [Custom Functions Overview](https://docs.microsoft.com/en-us/office/dev/add-ins/excel/custom-functions-overview) topic.

## Table of Contents
* [Change History](#change-history)
* [Prerequisites](#prerequisites)
* [To use the project](#to-use-the-project)
* [Making changes](#making-changes)
* [Debugging](#debugging)
* [Intellisense for the JSON file in Visual Studio Code](#intellisense-for-the-json-file-in-visual-studio-code)
* [Questions and comments](#questions-and-comments)
* [Additional resources](#additional-resources)

## Change History

* Oct 27, 2017: Initial version.
* April 23, 2018: Revised and expanded.
* May 7, 2018: Updated for the Build preview release of custom functions

## Prerequisites

* Install Office 2016 for Windows or Mac and join the [Office Insider](https://products.office.com/en-us/office-insider) program. You must also have Office build build 9325+ on Windows or 13.329+ on Mac.

## To use the project

Follow these instructions to use this custom function sample add-in:

1. Publish the code files (HTML, JS, and JSON) to localhost.
2. Replace `http://127.0.0.1:8080` in the manifest file (there are 4 occurrences) with the URL you used, if needed (you might be using a different port number). 
3. Sideload the manifest using the instructions found at <https://aka.ms/sideload-addins>.
4. Test a custom function by entering `=CONTOSO.ADD42` in a cell.
5. Try the other functions in the sample: `=CONTOSO.ADD42ASYNC`, `CONTOSO.ISPRIME`, `CONTOSO.NTHPRIME`, `CONTOSO.GETDAY`, `CONTOSO.INCREMENTVALUE`, and `CONTOSO.SECONDHIGHEST`.
7. Follow @OfficeDev on Twitter for updates, post suggestions to the [Excel Add-ins UserVoice page](https://officespdev.uservoice.com/forums/224641-feature-requests-and-feedback/category/163563-add-in-excel) and tag Stack Overflow questions with the [custom-functions-excel](https://stackoverflow.com/questions/tagged/custom-functions-excel) tag.

## Making changes
If you make changes to the sample functions code (in the JS file), close and reopen Excel to test them.

If you change the functions metadata (in the JSON file), close Excel and delete your cache folder `Users/<user>/AppData/Local/Microsoft/Office/16.0/Wef/CustomFunctions`. Then re-insert the add-in using **Insert** > **My Add-ins**.

## Debugging
Debugging is only available for asynchronous functions on Excel for Windows currently. To debug:

1. Enable script debugging in Internet Explorer (IE > Options > Advanced).
2. Trigger an asynchronous function in Excel (like `CONTOSO.ADD42ASYNC`). This step ensures that the asynchronous function process is loaded invisibly and ready for debugging.
3. Attach a debugger to the hidden iexplore.exe script process (you could use the [Windows F12 debugger](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/debug-add-ins-using-f12-developer-tools-on-windows-10) or Visual Studio).

## Intellisense for the JSON file in Visual Studio Code	
For intellisense to help you edit the JSON file, follow these steps:

1. Open the JSON file (it has a .json extension) in Visual Studio Code.	
2. If you are starting a new file from scratch, add the following to the top of the file:	
	
     ```js	
    {	
        "$schema": "https://developer.microsoft.com/en-us/json-schemas/office-js/custom-functions.schema.json",	
    ```	
3. Press **Ctrl+Space** and intellisense will prompt you with a list of all items that are valid at the cursor point. For example, if you pressed **Ctrl+Space** immediately after the `"$schema"` line, you are prompted to enter `functions`, which is the only key that is valid at that point. Select it and the `"functions": []` array is entered. If the cursor is between the `[]`, then you are prompted to enter an empty object as a member of the array. If the cursor is in the object, then you are prompted with a list of the keys that are valid in the object.

## Feedback

We'd love to get your feedback about this sample. You can send your feedback to us in the *Issues* section of this repository.

Questions about Microsoft Office 365 development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/office-js+API). If your question is about the Office JavaScript APIs, make sure that your questions are tagged with [office-js] and [API].

## Additional resources

* [Custom Functions Overview](https://docs.microsoft.com/en-us/office/dev/add-ins/excel/custom-functions-overview)
* [Office add-in documentation](https://docs.microsoft.com/en-us/office/dev/add-ins/overview/office-add-ins)
* More Office Add-in samples at [OfficeDev on Github](https://github.com/officedev)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Copyright
Copyright (c) 2017 Microsoft Corporation. All rights reserved.
