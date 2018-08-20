/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* global __fbBatchedBridge, self, importScripts, postMessage, onmessage: true */ // eslint-disable-line

/* eslint-disable */

/**
 * IMPORTANT: Do not add "use strict"
 * https://github.com/callstack/haul/issues/278
 *
 * Some libraries like react-native-safe-module try to patch native modules to mock them
 * and prevent crashes, but don't account for the case when `requireNativeComponent` returns
 * a string. In strict mode, trying to modify properties of the string primitive throws an
 * error - "Cannot create property...". This breaks some modules like Lottie which use
 * react-native-safe-module
 */

const fetch = require('node-fetch');

process.on('message', function (message) {

    let visibilityState;
    let shouldQueueMessages = false;
    const messageQueue = [];

    const processEnqueuedMessages = function () {
        while (messageQueue.length) {
            const messageProcess = messageQueue.shift();
            messageProcess();
        }
        shouldQueueMessages = false;
    };

    const messageHandlers = {
        executeApplicationScript(message, sendReply) {
            for (const key in message.inject) {
                global[key] = JSON.parse(message.inject[key]);
            }

            shouldQueueMessages = true;

            function evalJS(js) {
                try {
                    eval(js.replace(/this\["webpackHotUpdate"\]/g, 'self["webpackHotUpdate"]').replace('GLOBAL', 'global'));
                } catch (error) {
                    console.log(error.message);
                    console.log(error.stack);
                } finally {
                    process.send({ replyID: message.id });
                    processEnqueuedMessages();
                }
            }

            fetch(message.url)
                .then(resp => resp.text())
                .then(evalJS);
        },
        //We are not using the value anywhere, nevertheless, we still receive this message so we just update the variable...
        setDebuggerVisibility(message) {
            visibilityState = message.visibilityState;
        }
    };

    const processMessage = function () {
        if (visibilityState === 'hidden') {
            console.log(`Visibility state is hidden`);
        }

        const sendReply = function (result, error) {
            process.send({ replyID: message.id, result, error });
        };

        const handler = messageHandlers[message.method];

        // Special cased handlers
        if (handler) {
            handler(message, sendReply);
            return;
        }

        // Other methods get called on the bridge
        let returnValue = [[], [], [], 0];
        try {
            if (typeof __fbBatchedBridge === 'object') {
                returnValue = __fbBatchedBridge[message.method].apply(null, message.arguments);
            }
        } finally {
            sendReply(JSON.stringify(returnValue));
        }
    };

    if (shouldQueueMessages) {
        messageQueue.push(processMessage);
    } else {
        processMessage();
    }
});
