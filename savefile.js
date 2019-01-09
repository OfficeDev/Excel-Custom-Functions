let fs = require('fs');

const tempDir = process.env.TEMP;
const defaultRuntimeLogFileName = "CFValues.log";
let path = `${tempDir}\\${defaultRuntimeLogFileName}`;

writeReadFile();

async function writeReadFile(){
    await saveFile();
    await readFile();
}

async function saveFile()
{
  const file = fs.openSync(path, "a+");
  fs.writeFile(path, 'Hello content!', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  fs.closeSync(file);
}

async function readFile()
{
    var content;
    fs.readFile(path, "utf8", function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        console.log(content);
    });
}