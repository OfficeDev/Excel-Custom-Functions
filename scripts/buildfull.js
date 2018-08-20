const child_process = require('child_process');
const path = require('path');
const buildScriptPath = path.resolve(__dirname, 'build.js');
child_process.spawn('node', [buildScriptPath, '--ignore-build-config'], { stdio: 'inherit' });
