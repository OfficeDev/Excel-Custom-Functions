/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

Office.initialize = function(reason){
    // Define the Contoso prefix.
    Excel.Script.CustomFunctions = {};
    Excel.Script.CustomFunctions["CONTOSO"] = {};

    // add42 is an example of a synchronous function.
    function add42 (a, b) {
        return a + b + 42;
    }    
    Excel.Script.CustomFunctions["CONTOSO"]["ADD42"] = {
        call: add42,
        description: "Finds the sum of two numbers and 42.",
        helpUrl: "https://www.contoso.com/help.html",
        result: {
            resultType: Excel.CustomFunctionValueType.number,
            resultDimensionality: Excel.CustomFunctionDimensionality.scalar,
        },
        parameters: [
            {
                name: "num 1",
                description: "The first number",
                valueType: Excel.CustomFunctionValueType.number,
                valueDimensionality: Excel.CustomFunctionDimensionality.scalar,
            },
            {
                name: "num 2",
                description: "The second number",
                valueType: Excel.CustomFunctionValueType.number,
                valueDimensionality: Excel.CustomFunctionDimensionality.scalar,
            }
        ],
        options:{ batch: false, stream: false }
    };
    
    // getTemperature is an example of an asynchronous function.
    function getTemperature(thermometerID){
        return new OfficeExtension.Promise(function(setResult, setError){
            sendWebRequestExample(thermometerID, function(data){
                setResult(data.temperature);
            });
        });
    }
    Excel.Script.CustomFunctions["CONTOSO"]["GETTEMPERATURE"] = {
        call: getTemperature,
        description: "Returns the temperature of a sensor.",
        helpUrl: "https://www.contoso.com/help.html",
        result: {
            resultType: Excel.CustomFunctionValueType.number,
            resultDimensionality: Excel.CustomFunctionDimensionality.scalar,
        },
        parameters: [
            {
                name: "thermometer ID",
                description: "The ID of the thermometer to read.",
                valueType: Excel.CustomFunctionValueType.string,
                valueDimensionality: Excel.CustomFunctionDimensionality.scalar,
            },
        ],
        options: { batch: false,  stream: false }
    };

    // incrementValue is an example of a streaming function.
    function incrementValue(increment, setResult){    
    	var result = 0;
        setInterval(function(){
            result += increment;
            setResult(result);
        }, 1000);
    }
    Excel.Script.CustomFunctions["CONTOSO"]["INCREMENTVALUE"] = {
        call: incrementValue,
        description: "Increments a counter that starts at zero.",
        helpUrl: "https://www.contoso.com/help.html",
        result: {
            resultType: Excel.CustomFunctionValueType.number,
            resultDimensionality: Excel.CustomFunctionDimensionality.scalar,
        },
        parameters: [
            {
                name: "period",
                description: "The time between updates, in milliseconds.",
                valueType: Excel.CustomFunctionValueType.number,
                valueDimensionality: Excel.CustomFunctionDimensionality.scalar,
            },
        ],
        options: { batch: false,  stream: true }
    };
    
    // The refreshTemperature and streamTemperature functions use global variables to save & read state, while streaming data.
    var savedTemperatures = {};
    function refreshTemperature(thermometerID){        
        sendWebRequestExample(thermometerID, function(data){
            savedTemperatures[thermometerID] = data.temperature;
        });
        setTimeout(function(){
            refreshTemperature(thermometerID);
        }, 1000);
    }
    function streamTemperature(thermometerID, setResult){    
        if(!savedTemperatures[thermometerID]){
            refreshTemperature(thermometerID);
        }
        function getNextTemperature(){
            setResult(savedTemperatures[thermometerID]);
            setTimeout(getNextTemperature, 1000);
        }
        getNextTemperature();
    }
    Excel.Script.CustomFunctions["CONTOSO"]["STREAMTEMPERATURE"] = {
        call: streamTemperature,
        description: "Updates the displayed temperature of the sensor in the Excel UI every second.",
        helpUrl: "https://www.contoso.com/help.html",
        result: {
            resultType: Excel.CustomFunctionValueType.number,
            resultDimensionality: Excel.CustomFunctionDimensionality.scalar,
        },
        parameters: [
            {
                name: "thermometer ID",
                description: "The ID of the thermometer to read.",
                valueType: Excel.CustomFunctionValueType.string,
                valueDimensionality: Excel.CustomFunctionDimensionality.scalar,
            },
        ],
        options: { batch: false,  stream: true }
    };

    // secondHighestTemp is a function that accepts and uses a range of data. The range is sent to the function as a parameter.
    function secondHighestTemp(temperatures){ 
        var highest = -273, secondHighest = -273;
        for(var i = 0; i < temperatures.length;i++){
            for(var j = 0; j < temperatures[i].length;j++){
                if(temperatures[i][j] >= highest){
                    secondHighest = highest;
                    highest = temperatures[i][j];
                }
                else if(temperatures[i][j] >= secondHighest){
                    secondHighest = temperatures[i][j];
                }
            }
        }
        return secondHighest;
    }

    Excel.Script.CustomFunctions["CONTOSO"]["SECONDHIGHESTTEMP"] = {
        call: secondHighestTemp,
        description: "Returns the second highest tempature in the supplied range of temperatures.",
        helpUrl: "https://www.contoso.com/help.html",
        result: {
            resultType: Excel.CustomFunctionValueType.number,
            resultDimensionality: Excel.CustomFunctionDimensionality.scalar,
        },
        parameters: [
            {
                name: "temps",
                description: "The range of temperatures to compare.",
                valueType: Excel.CustomFunctionValueType.number,
                valueDimensionality: Excel.CustomFunctionDimensionality.matrix,
            },
        ],
        options: { batch: false, stream: false }
    };

    // Register all the custom functions previously defined in Excel.
    Excel.run(function (context) {        
        context.workbook.customFunctions.addAll();
        return context.sync().then(function(){});
    }).catch(function(error){});

    // The following are helper functions.

    // sendWebRequestExample is intended to simulate a web request to read a temperature. The code in this function does not actually make a web request. 
    function sendWebRequestExample(input, callback){
        var result = {};
        // Generate a temperature.
        result["temperature"] = 42 - (Math.random() * 10);
        setTimeout(function(){
            callback(result);
        }, 250);
    }

    // The log function lets you write debugging messages into Excel (first evaluate the MY.DEBUG function in Excel). You can also debug with regular debugging tools like Visual Studio.
    var debug = [];
    var debugUpdate = function(data){};
    function log(myText){
        debug.push([myText]);
        debugUpdate(debug);
    }
    function myDebug(setResult){
        debugUpdate = setResult;
    }
   
}; 