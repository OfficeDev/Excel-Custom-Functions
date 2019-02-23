# Debugging

## Prerequisites

1. Node.js version 8 or higher. 
2. VS Code - latest version recommended. 

## First Time

1. Trust the SSL certificates for `https://localhost`. [More info](https://github.com/OfficeDev/generator-office/blob/master/src/docs/ssl.md)
2. On Mac, enable debugging for the webview using Safari Web Inspector.
    
    In a Terminal window, run these commands:
    ```
    defaults write com.microsoft.Word OfficeWebAddinDeveloperExtras -bool true
    defaults write com.microsoft.Excel OfficeWebAddinDeveloperExtras -bool true
    defaults write com.microsoft.Powerpoint OfficeWebAddinDeveloperExtras -bool true
    defaults write com.microsoft.Outlook OfficeWebAddinDeveloperExtras -bool true
    ```

## Using Visual Studio Code

1. Open the folder in VS Code.
2. Run the `Dev Server` task using `Terminal`, `Run Task`.

    The first time, open a browser to https://localhost:3000 to verify that the SSL certificates are trusted.

### Office Online (Edge - Windows 10 / Chrome - Mac)
1. Switch to the Debug view using `View`, `Debug` or press Ctrl+Shift+D.
2. Choose the desired debug configuration:
    * `Office Online (Edge)`
    * `Office Online (Chrome)`
3. Start debugging by pressing F5 or the green play icon.
4. When prompted, paste the url for an Office document. You can obtain this by copying the link when sharing a document.
5. Use `Insert`, `Add-ins` to upload the manifest file. [More info](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing_)
* NOTE: You can also use the browser dev tools to debug.


### Excel / PowerPoint / Word (Windows / Mac)
1. Switch to the Debug view.
2. Choose the desired debug configuration from the list: 
   * `Excel Desktop`
   * `PowerPoint Desktop`
   * `Word Desktop`
3. Choose `Start Without Debugging` from the `Debug` menu.
   NOTE: The integrated VSCode debugger cannot debug the Office Add-in running in the task pane. 
4. To debug, you need to use another debugger:
    * `Edge DevTools` (Windows 10)
    * `F12 DevTools` (Windows)
    * `Visual Studio` (Windows)
    * `Safari Inspector` (Mac)


## From the command line

### Build
* To build for production, use `npm run build`.

### Dev Server
* Use `npm run dev-server` to run the dev-server.

### Debugging (Desktop)
* To start debugging, use `npm start desktop -- --app {app}` where `{app}` is `excel`, `powerpoint`, or `word`.
* If the dev-server is not already running, it will run the dev-server in a separate window.
* The add-in will be configured for debugging, and a document will be opened which loads the add-in.
* Once you're done debugging, use `npm stop desktop -- --app {app}` so the add-in is no longer configured for debugging.

### Debugging (Office Online)
* To start debugging, use `npm start web`.
* If the dev-server is not already running, it will run the dev-server in a separate window.
* Open the desired Office document in the browser.
* Use `Insert`, `Add-ins` to upload the manifest file. [More info](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing_)
* Use the browser dev tools to debug.
