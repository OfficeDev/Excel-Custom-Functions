const fs = require("fs");
const path = require("path");
const util = require("util");
const testPackages = ["@types/mocha", "@types/node", "current-processes", "mocha", "office-addin-test-helpers",
    "office-addin-test-server", "ts-node"];
const readFileAsync = util.promisify(fs.readFile);
const unlinkFileAsync = util.promisify(fs.unlink);
const writeFileAsync = util.promisify(fs.writeFile);

async function removeTestInfraStructure() {
    deleteFolder(path.resolve(`${process.cwd()}/test`));
    deleteFolder(path.resolve(`${process.cwd()}/.github`));
    await updatePackageJsonFile();
    await updateLaunchJsonFile();
    // delete this script
    await unlinkFileAsync("./convertToSingleHost.js");
}

async function updatePackageJsonFile() {
    // update package.json to reflect selected host
    const packageJson = `./package.json`;
    const data = await readFileAsync(packageJson, "utf8");
    let content = JSON.parse(data);

    // remove scripts that are unrelated to the selected host
    Object.keys(content.scripts).forEach(function (key) {
        if (key === "convert-to-single-host" || key === "test") {
            delete content.scripts[key];
        }
    });

    // remove test-related packages
    Object.keys(content.devDependencies).forEach(function (key) {
        if (testPackages.includes(key)) {
            delete content.devDependencies[key]
        }
    });

    // write updated json to file
    await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updateLaunchJsonFile() {
    // remove 'Debug Tests' configuration from launch.json
    const launchJson = `.vscode/launch.json`;
    const launchJsonContent = await readFileAsync(launchJson, "utf8");
    const regex = /"configurations": \[\r?\n(.*{(.*\r?\n)*?.*"name": "Debug Tests",\r?\n(.*\r?\n)*?.*},)/gm;
    const updatedContent = launchJsonContent.replace(regex, `"configurations": [`);
    await writeFileAsync(launchJson, updatedContent);
}

function deleteFolder(folder) {
    try {
        if (fs.existsSync(folder)) {
            fs.readdirSync(folder).forEach(function (file, index) {
                const curPath = `${folder}/${file}`;

                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolder(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folder);
        }
    } catch (err) {
        throw new Error(`Unable to delete folder "${folder}".\n${err}`);
    }
}

/**
 * Remove test infrastructure from project.
 */
removeTestInfraStructure().catch(err => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
});
