/* global require, process, console */

const fs = require("fs");
const host = process.argv[2];
const manifestType = process.argv[3];
const hosts = ["excel", "onenote", "outlook", "powerpoint", "project", "word"];
const path = require("path");
const util = require("util");
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
  await updateLaunchJsonFile();
}

async function convertProjectToSingleHost(host) {
  // Copy host-specific manifest over manifest.xml
  const manifestContent = await readFileAsync(`./manifest.${host}.xml`, "utf8");
  await writeFileAsync(`./manifest.xml`, manifestContent);

  // Copy over host-specific taskpane code to taskpane.ts
  const srcContent = await readFileAsync(`./src/taskpane/${host}.ts`, "utf8");
  await writeFileAsync(`./src/taskpane/taskpane.ts`, srcContent);

  // Delete all host-specific files
  hosts.forEach(async function (host) {
    await unlinkFileAsync(`./manifest.${host}.xml`);
    await unlinkFileAsync(`./src/taskpane/${host}.ts`);
  });

  // Delete test folder
  deleteFolder(path.resolve(`./test`));

  // Delete the .github folder
  deleteFolder(path.resolve(`./.github`));

  // Delete CI/CD pipeline files
  deleteFolder(path.resolve(`./.azure-devops`));

  // Delete repo support files
  await deleteSupportFiles();
}

async function updatePackageJsonForSingleHost(host) {
  // Update package.json to reflect selected host
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);
  
  // Update 'config' section in package.json to use selected host
  content.config["app_to_debug"] = host;

  // Remove 'engines' section
  delete content.engines;

  // Remove scripts that are unrelated to the selected host
  Object.keys(content.scripts).forEach(function (key) {
    if (
      key === "convert-to-single-host" ||
      key === "start:desktop:outlook"
    ) {
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
  
  // Write updated json to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updateLaunchJsonFile() {
  // Remove 'Debug Tests' configuration from launch.json
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
  await unlinkFileAsync("./convertToSingleHost.js");
  await unlinkFileAsync(".npmrc");
  await unlinkFileAsync("package-lock.json");
}

async function deleteUnifiedManifestRelatedFiles() {
  await unlinkFileAsync("manifest.json");
  await unlinkFileAsync("unified-manifest-webpack.config.js");
  await unlinkFileAsync("assets/color.png");
  await unlinkFileAsync("assets/outline.png");
  await unlinkFileAsync(".vscode/unified-manifest-launch.json");
  await unlinkFileAsync(".vscode/unified-manifest-tasks.json");
}

async function deleteXMLManifestRelatedFiles() {
  await unlinkFileAsync("webpack.config.js");
  await unlinkFileAsync(".vscode/launch.json");
  await unlinkFileAsync(".vscode/tasks.json");
  await unlinkFileAsync("manifest.xml");
}

async function updatePackageJsonForXMLManifest() {
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // Remove scripts that are only used with unified manifest
  delete content.scripts["signin"];
  delete content.scripts["signout"];
  
  // Write updated json to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function updatePackageJsonForUnifiedManifest() {
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
  
  // Write updated json to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}

async function renameManifestTypeSpecificFiles() {
  const webpackConfigContent = await readFileAsync(`./unified-manifest-webpack.config.js`, "utf8");
  await writeFileAsync(`./webpack.config.js`, webpackConfigContent);
  await unlinkFileAsync("unified-manifest-webpack.config.js");
  const launchJsonContent = await readFileAsync(`./.vscode/unified-manifest-launch.json`, "utf8");
  await writeFileAsync(`./.vscode/launch.json`, launchJsonContent);
  await unlinkFileAsync(".vscode/unified-manifest-launch.json");
  const tasksJsonContent = await readFileAsync(`./.vscode/unified-manifest-tasks.json`, "utf8");
  await writeFileAsync(`./.vscode/tasks.json`, tasksJsonContent);
  await unlinkFileAsync(".vscode/unified-manifest-tasks.json");
}

async function modifyProjectForUnifiedManifest() {
  await updatePackageJsonForUnifiedManifest();
  await deleteXMLManifestRelatedFiles();
  await renameManifestTypeSpecificFiles();
}

/**
 * Modify the project so that it only supports a single host.
 * @param host The host to support.
 */
modifyProjectForSingleHost(host).catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});

if ((host !== "outlook") || (manifestType !== "unified")) {
  // Remove things that are only relevant to unified manifest
  deleteUnifiedManifestRelatedFiles();
  updatePackageJsonForXMLManifest();
} else {
    modifyProjectForUnifiedManifest().catch((err) => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  });
}
 