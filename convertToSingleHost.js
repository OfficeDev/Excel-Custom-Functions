/* global require, process, console */

const fs = require("fs");
const path = require("path");
const util = require("util");
const childProcess = require("child_process");

const manifestType = process.argv[2];
const projectName = process.argv[3];
let appId = process.argv[4];
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
  // Delete test folder
  deleteFolder(path.resolve(`./test`));

  // Delete the .github folder
  deleteFolder(path.resolve(`./.github`));

  // Delete CI/CD pipeline files
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

  // Remove test-related packages
  Object.keys(content.devDependencies).forEach(function (key) {
    if (testPackages.includes(key)) {
      delete content.devDependencies[key];
    }
  });

  // Write updated JSON to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updateLaunchJsonFile() {
  // Remove 'Debug Tests' configuration from launch.json
  const launchJson = `.vscode/launch.json`;
  const launchJsonContent = await readFileAsync(launchJson, "utf8");
  let content = JSON.parse(launchJsonContent);
  content.configurations = content.configurations.filter(function (config) {
    return config.name.startsWith("Excel");
  });
  await writeFileAsync(launchJson, JSON.stringify(content, null, 2));
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

async function deleteJSONManifestRelatedFiles() {
  await unlinkFileAsync("manifest.json");
  await unlinkFileAsync("assets/color.png");
  await unlinkFileAsync("assets/outline.png");
}

async function deleteXMLManifestRelatedFiles() {
  await unlinkFileAsync("manifest.xml");
}

async function updatePackageJsonForXMLManifest() {
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // Remove scripts that are only used with JSON manifest
  delete content.scripts["signin"];
  delete content.scripts["signout"];

  // Write updated JSON to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updatePackageJsonForJSONManifest() {
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // Remove special start scripts
  Object.keys(content.scripts).forEach(function (key) {
    if (key.includes("start:")) {
      delete content.scripts[key];
    }
  });

  // Change manifest file name extension
  content.scripts.start = "office-addin-debugging start manifest.json";
  content.scripts.stop = "office-addin-debugging stop manifest.json";
  content.scripts.validate = "office-addin-manifest validate manifest.json";

  // Write updated JSON to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updateTasksJsonFileForJSONManifest() {
  const tasksJson = `.vscode/tasks.json`;
  const data = await readFileAsync(tasksJson, "utf8");
  let content = JSON.parse(data);

  content.tasks.forEach(function (task) {
    if (task.label.startsWith("Build")) {
      task.dependsOn = ["Install"];
    }
    if (task.label === "Debug: Outlook Desktop") {
      task.script = "start";
      task.dependsOn = ["Check OS", "Install"];
    }
  });

  const checkOSTask = {
    label: "Check OS",
    type: "shell",
    windows: {
      command: "echo 'Sideloading in Outlook on Windows is supported'",
    },
    linux: {
      command: "echo 'Sideloading on Linux is not supported' && exit 1",
    },
    osx: {
      command: "echo 'Sideloading in Outlook on Mac is not supported' && exit 1",
    },
    presentation: {
      clear: true,
      panel: "dedicated",
    },
  };

  content.tasks.push(checkOSTask);
  await writeFileAsync(tasksJson, JSON.stringify(content, null, 2));
}

async function updateWebpackConfigForJSONManifest() {
  const webPack = `webpack.config.js`;
  const webPackContent = await readFileAsync(webPack, "utf8");
  const updatedContent = webPackContent.replace(".xml", ".json");
  await writeFileAsync(webPack, updatedContent);
}

async function modifyProjectForJSONManifest() {
  await updatePackageJsonForJSONManifest();
  await updateWebpackConfigForJSONManifest();
  await updateTasksJsonFileForJSONManifest();
  await deleteXMLManifestRelatedFiles();
}


/**
 * Remove test infrastructure and repo support files from project.
 */
removeTestInfraStructure().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});

let manifestPath = "manifest.xml";

// Uncomment when template supports JSON manifest
// if (host !== "outlook" || manifestType !== "json") {
  // Remove things that are only relevant to JSON manifest
  deleteJSONManifestRelatedFiles();
  updatePackageJsonForXMLManifest();
// } else {
//   manifestPath = "manifest.json";
//   modifyProjectForJSONManifest().catch((err) => {
//     console.error(`Error modifying for JSON manifest: ${err instanceof Error ? err.message : err}`);
//     process.exitCode = 1;
//   });
// }

if (projectName) {
  if (!appId) {
    appId = "random";
  }

  // Modify the manifest to include the name and id of the project
  const cmdLine = `npx office-addin-manifest modify ${manifestPath} -g ${appId} -d ${projectName}`;
  childProcess.exec(cmdLine, (error, stdout) => {
    if (error) {
      Promise.reject(stdout);
    } else {
      Promise.resolve();
    }
  });
}
