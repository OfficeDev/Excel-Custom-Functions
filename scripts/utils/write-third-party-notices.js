const preambleText = `THIRD-PARTY SOFTWARE NOTICES AND INFORMATION
Do Not Translate or Localize

Office incorporates components from the Open Source Software below.
Microsoft licenses these components under the Office software license
terms. The original copyright notices and the licenses under which Microsoft
received such components are set forth below for informational purposes.
Microsoft reserves all rights not expressly granted herein, whether by
implication, estoppel or otherwise.

`;

const path = require('path');

module.exports = function writeThirdPartyNotices(rootPath, sourceMapFile, outputFile, ignoreScopes, ignoreModules) {
  let eol = require('eol');
  let fs = require('fs');
  let os = require('os');
  let util = require('util');

  const readFileAsync = util.promisify(fs.readFile);
  const writeFileAsync = util.promisify(fs.writeFile);

  let licenseExtractors = require('browserify-licenses/app/extractors');

  let moduleNameToPath = new Map();
  const modulesRoot = 'node_modules/';
  if (!ignoreModules) {
    ignoreModules = [];
  }
  if (!ignoreScopes) {
    ignoreScopes = [];
  }
  let outputText = '';

  const normalizePath = p => {
    return p
      .replace(/webpack:\/\/\//g, '')
      .replace(/[\\]+/g, '/')
      .toLowerCase();
  };

  const splitSourcePath = p => {
    let nodeModulesPath = p.substring(0, p.indexOf(modulesRoot) + modulesRoot.length);
    let relativeSourcePath = p.substring(nodeModulesPath.length);
    let moduleName;
    if (relativeSourcePath[0] === '@') {
      moduleName = relativeSourcePath
        .split('/')
        .slice(0, 2)
        .join('/');
    } else {
      moduleName = relativeSourcePath.split('/')[0];
    }
    return [moduleName, path.resolve(rootPath, `${nodeModulesPath}${moduleName}`)];
  };

  const parseModule = p => {
    let [moduleName, modulePath] = splitSourcePath(p);
    if (ignoreScopes.some(scope => moduleName.startsWith(scope)) || ignoreModules.includes(moduleName)) {
      return;
    }
    moduleNameToPath.set(moduleName, modulePath);
  };

  const parseSourceMap = sourceMap => {
    sourceMap.sources.forEach(source => {
      source = normalizePath(source);
      if (source.includes(modulesRoot)) {
        parseModule(source);
      }
    });
  };

  const writeLine = s => {
    outputText += `${s || ''}${os.EOL}`;
  };

  const writeMultipleLines = s => {
    let lines = eol.split(s);
    lines.forEach(line => {
      writeLine(line);
    });
  };

  const finalizeOutput = () => {
    return writeFileAsync(outputFile, outputText, 'utf8');
  };

  // Parse source map file
  return readFileAsync(sourceMapFile, 'utf8')
    .then(json => {
      let sourceMap = JSON.parse(json);
      if (sourceMap.sources) {
        parseSourceMap(sourceMap);
      }
      if (sourceMap.sections) {
        sourceMap.sections.forEach(section => {
          parseSourceMap(section.map);
        });
      }

      let moduleNamePathPairs = [];
      moduleNameToPath.forEach((modulePath, moduleName) => {
        // If both foo and @foo/bar exist, only include the license for foo
        if (moduleName[0] === '@') {
          let parentModuleName = moduleName.split('/')[0].substring(1);
          if (moduleNameToPath.has(parentModuleName)) {
            moduleNameToPath.delete(moduleName);
            return;
          }
        }

        moduleNamePathPairs.push({
          name: moduleName,
          path: modulePath
        });
      });

      // Extract licenses of all modules we found
      return licenseExtractors.nodeModule(moduleNamePathPairs);
    })
    .then(licenses => {
      // Look up licenses and emit combined license text
      writeMultipleLines(preambleText);
      [...moduleNameToPath.keys()].sort().forEach(moduleName => {
        let modulePath = moduleNameToPath.get(moduleName);
        let license = licenses.find(license => license.path === modulePath);
        if (!license) {
          throw new Error(`Cannot find license information for ${moduleName}`);
        }
        if (!license.licenseText) {
          if (!license.license && (!license.licenseURLs || license.licenseURLs.length == 0)) {
            throw new Error(`No license text or URL for ${moduleName}`);
          }
          license.licenseText = `${license.license} (${license.licenseURLs.join(' ')})`;
        }
        writeLine('================================================');
        writeLine(`${moduleName} ${license.version}`);
        writeLine('=====');
        writeMultipleLines(license.licenseText.trim());
        writeLine('================================================');
        writeLine();
      });
      return finalizeOutput();
    });
};
