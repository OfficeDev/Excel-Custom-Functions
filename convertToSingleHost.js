// NOTE: This script is generally in sync with other template repos (with minor differences) even though this template doesn't support different hosts.
// It's easier to maintain the script in one place and copy it over to other repos than to maintain multiple versions of the script.

/* global require, process, console */

const fs = require("fs");
const path = require("path");
const util = require("util");
const childProcess = require("child_process");
const hosts = ["excel"];

if (process.argv.length <= 2) {
  const hostList = hosts.map((host) => `'${host}'`).join(", ");
  console.log("SYNTAX: convertToSingleHost.js <host> <manifestType> <projectName> <appId>");
  console.log();
  console.log(`  host (required): Specifies which Office app will host the add-in: ${hostList}`);
  console.log(`  manifestType: Specify the type of manifest to use: 'xml' or 'json'.  Defaults to 'xml'`);
  console.log(`  projectName: The name of the project (use quotes when there are spaces in the name). Defaults to 'My Office Add-in'`);
  console.log(`  appId: The id of the project or 'random' to generate one.  Defaults to 'random'`);
  console.log();
  process.exit(1);
}

const host = process.argv[2];
const manifestType = process.argv[3];
const projectName = process.argv[4];
let appId = process.argv[5];
const testPackages = [
  "@types/mocha",
  "@types/node",
  "mocha",
  "office-addin-mock",
  "office-addin-test-helpers",
  "office-addin-test-server",
  "ts-node",
];
const readFileAsync = util.promisify(fs.readFile);
const unlinkFileAsync = util.promisify(fs.unlink);
const writeFileAsync = util.promisify(fs.writeFile);

async function modifyProjectForSingleHost(host) {
  if (!host) {
    throw new Error("The host was not provided.");
  }
  if (!hosts.includes(host)) {
    throw new Error(`'${host}' is not a supported host.`);
  }
  await convertProjectToSingleHost(host);
  await updatePackageJsonForSingleHost(host);
  await updateLaunchJsonFile(host);
}

async function convertProjectToSingleHost(host) {
  // NOTE: This template only supports Excel, so we don't need to deal with host specific files.

  // Copy host-specific manifest over manifest.xml
  // const manifestContent = await readFileAsync(`./manifest.${host}.xml`, "utf8");
  // await writeFileAsync(`./manifest.xml`, manifestContent);

  // Copy over host-specific taskpane code to taskpane.ts
  // const srcContent = await readFileAsync(`./src/taskpane/${host}.ts`, "utf8");
  // await writeFileAsync(`./src/taskpane/taskpane.ts`, srcContent);

  // Delete all host-specific files
  // hosts.forEach(async function (host) {
  //   await unlinkFileAsync(`./manifest.${host}.xml`);
  //   await unlinkFileAsync(`./src/taskpane/${host}.ts`);
  // });

  // Delete test folder
  deleteFolder(path.resolve(`./test`));

  // Delete the .github folder
  deleteFolder(path.resolve(`./.github`));

  // Delete CI/CD pipeline files
  deleteFolder(path.resolve(`./.azure-devops`));

  // Delete repo support files
  await deleteSupportFiles();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updatePackageJsonForSingleHost(host) {
  // Update package.json to reflect selected host
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // Update 'config' section in package.json to use selected host
  //content.config["app_to_debug"] = host;

  // Remove 'engines' section
  delete content.engines;

  // Remove scripts that are unrelated to the selected host
  Object.keys(content.scripts).forEach(function (key) {
    if (key === "convert-to-single-host") {
      delete content.scripts[key];
    }
  });

  // Remove test-related scripts
  Object.keys(content.scripts).forEach(function (key) {
    if (key.includes("test")) {
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

async function updateLaunchJsonFile(host) {
  // Remove 'Debug Tests' configuration from launch.json
  const launchJson = `.vscode/launch.json`;
  const launchJsonContent = await readFileAsync(launchJson, "utf8");
  let content = JSON.parse(launchJsonContent);
  content.configurations = content.configurations.filter(function (config) {
    return config.name.startsWith(getHostName(host));
  });
  await writeFileAsync(launchJson, JSON.stringify(content, null, 2));
}

function getHostName(host) {
  switch (host) {
    case "excel":
      return "Excel";
    case "onenote":
      return "OneNote";
    case "outlook":
      return "Outlook";
    case "powerpoint":
      return "PowerPoint";
    case "project":
      return "Project";
    case "word":
      return "Word";
    default:
      throw new Error(`'${host}' is not a supported host.`);
  }
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
  await unlinkFileAsync("./convertToSingleHost.js");
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

  // Write updated JSON to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updatePackageJsonForJSONManifest() {
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

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
 * Modify the project so that it only supports a single host.
 * @param host The host to support.
 */
modifyProjectForSingleHost(host).catch((err) => {
  console.error(`Error modifying for single host: ${err instanceof Error ? err.message : err}`);
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
  const cmdLine = `npx office-addin-manifest modify ${manifestPath} -g ${appId} -d "${projectName}"`;
  childProcess.exec(cmdLine, (error, stdout) => {
    if (error) {
      console.error(`Error updating the manifest: ${error}`);
      process.exitCode = 1;
    } else {
      console.log(stdout);
    }
  });
}
