const child_process = require('child_process');
const path = require('path');
const buildScriptPath = path.resolve(__dirname, 'build.js');
child_process.spawn('node', [buildScriptPath, '--min-build'], { stdio: 'inherit' });
