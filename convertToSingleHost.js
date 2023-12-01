/* global require, process, console */

const fs = require("fs");
const path = require("path");
const util = require("util");
const testPackages = [
  "@types/mocha",
  "@types/node",
  "current-processes",
  "mocha",
  "office-addin-mock",
  "office-addin-test-helpers",
  "office-addin-test-server",
  "ts-node",
];
const readFileAsync = util.promisify(fs.readFile);
const unlinkFileAsync = util.promisify(fs.unlink);
const writeFileAsync = util.promisify(fs.writeFile);

async function removeTestInfraStructure() {
  deleteFolder(path.resolve(`./test`));

  // delete the .github folder
  deleteFolder(path.resolve(`./.github`));

  // delete CI/CD pipeline files
  deleteFolder(path.resolve(`./.azure-devops`));

  await updatePackageJsonFile();
  await updateLaunchJsonFile();
  // delete this script
  await unlinkFileAsync("./convertToSingleHost.js");
  await deleteSupportFiles();
}

async function updatePackageJsonFile() {
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // remove scripts that are unrelated to testing or this file
  Object.keys(content.scripts).forEach(function (key) {
    if (key === "convert-to-single-host" || key.includes("test")) {
      delete content.scripts[key];
    }
  });

  // remove test-related packages
  Object.keys(content.devDependencies).forEach(function (key) {
    if (testPackages.includes(key)) {
      delete content.devDependencies[key];
    }
  });

  // write updated json to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updateLaunchJsonFile() {
  // remove 'Debug Tests' configuration from launch.json
  const launchJson = `.vscode/launch.json`;
  const launchJsonContent = await readFileAsync(launchJson, "utf8");
  const regex = /(.+{\r?\n.*"name": "Debug (?:UI|Unit) Tests",\r?\n(?:.*\r?\n)*?.*},.*\r?\n)/gm;
  const updatedContent = launchJsonContent.replace(regex, "");
  await writeFileAsync(launchJson, updatedContent);
}

function deleteFolder(folder) {
  try {
    if (fs.existsSync(folder)) {
      fs.readdirSync(folder).forEach(function (file) {
        const curPath = `${folder}/${file}`;

        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolder(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folder);
    }
  } catch (err) {
    throw new Error(`Unable to delete folder "${folder}".\n${err}`);
  }
}

async function deleteSupportFiles() {
  await unlinkFileAsync("CONTRIBUTING.md");
  await unlinkFileAsync("LICENSE");
  await unlinkFileAsync("README.md");
  await unlinkFileAsync("SECURITY.md");
  await unlinkFileAsync(".npmrc");
  await unlinkFileAsync("package-lock.json");
}

/**
 * Remove test infrastructure and repo support files from project.
 */
removeTestInfraStructure().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
