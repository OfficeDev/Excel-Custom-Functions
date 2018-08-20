(function () {
    function connectToDebuggerProxy() {
        var fork = require('child_process').fork;
        var WebSocket = require('ws');

        var ws = new WebSocket('ws://localhost:8081/debugger-proxy?role=debugger&name=SDXDebugger');
        var worker;

        function createJSRuntime() {
            // This worker will run the application javascript code,
            // making sure that it's run in an environment without a global
            // document, to make it consistent with the JSC executor environment.

            worker = fork('./debuggerWorker.js', [], { stdio: 'pipe', execArgv: ['--inspect-brk=9223'] });

            worker.on('message', function (message) {
                ws.send(JSON.stringify(message));
            });

            updateVisibility();
        }
        function shutdownJSRuntime() {
            if (worker) {
                worker.kill();
                worker = null;
            }
        }
        function updateVisibility() {
            if (worker) {
                worker.send({
                    method: 'setDebuggerVisibility',
                    visibilityState: 'visible'
                });
            }
        }
        ws.onopen = function () {
            console.log('Web socket opened...');
        };
        ws.onmessage = function (message) {
            if (!message.data) {
                return;
            }
            var object = JSON.parse(message.data);

            if (object.$event === 'client-disconnected') {
                shutdownJSRuntime();
                return;
            }
            if (!object.method) {
                return;
            }
            // Special message that asks for a new JS runtime
            if (object.method === 'prepareJSRuntime') {
                shutdownJSRuntime();
                console.clear();

                createJSRuntime();
                ws.send(JSON.stringify({ replyID: object.id }));
            } else if (object.method === '$disconnected') {
                shutdownJSRuntime();
            } else {
                worker.send(object);
            }
        };
        ws.onclose = function (e) {
            shutdownJSRuntime();
            if (e.reason) {
                console.log(`Web socket closed because the following reason: ${e.reason}`);
            }
            setTimeout(connectToDebuggerProxy, 500);
        };
    }
    connectToDebuggerProxy();
})();
