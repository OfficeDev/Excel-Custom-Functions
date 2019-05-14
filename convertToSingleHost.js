const fs = require("fs");
const host = process.argv[2];
const hosts = ["excel", "onenote", "outlook", "powerpoint", "project", "word"];
const util = require("util");
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
}

async function convertProjectToSingleHost(host) {
  // copy host-specific manifest over manifest.xml
  const manifestContent = await readFileAsync(`./manifest.${host}.xml`, "utf8");
  await writeFileAsync(`./manifest.xml`, manifestContent);

  // copy over host-specific taskpane code to taskpane.ts
  const srcContent = await readFileAsync(`./src/taskpane/${host}.ts`, "utf8");
  await writeFileAsync(`./src/taskpane/taskpane.ts`, srcContent);

  // delete all host-specific files
  hosts.forEach(async function(host) {
    await unlinkFileAsync(`./manifest.${host}.xml`);
    await unlinkFileAsync(`./src/taskpane/${host}.ts`);
  });

  // delete this script
  await unlinkFileAsync("./convertToSingleHost.js");
}

async function updatePackageJsonForSingleHost(host) {
  // update package.json to reflect selected host
  const packageJson = `./package.json`;
  const data = await readFileAsync(packageJson, "utf8");
  let content = JSON.parse(data);

  // update 'config' section in package.json to use selected host
  content.config["app-to-debug"] = host;

  // update sideload and unload scripts to use selected host.
  ["sideload", "unload"].forEach(key => {
    content.scripts[key] = content.scripts[`${key}:${host}`];
  });

  // remove scripts that are unrelated to the selected host
  Object.keys(content.scripts).forEach(function(key) {
    if (key.startsWith("sideload:") 
      || key.startsWith("unload:") 
      || key === "convert-to-single-host"
    ) {
      delete content.scripts[key];
    }
  });

  // write updated json to file
  await writeFileAsync(packageJson, JSON.stringify(content, null, 2));
}


/**
 * Modify the project so that it only supports a single host.
 * @param host The host to support.
 */
modifyProjectForSingleHost(host).catch(err => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
});
