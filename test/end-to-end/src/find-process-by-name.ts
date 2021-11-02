/* global require, process */

"use strict";

const path = require("path");
const utils = require("./find-process-utils");

function matchName(text, name) {
  if (!name) {
    return true;
  }
  // make sure text.match is valid, fix #30
  if (text && text.match) {
    return text.match(name);
  }
  return false;
}

function fetchBin(cmd) {
  const pieces = cmd.split(path.sep);
  const last = pieces[pieces.length - 1];
  if (last) {
    pieces[pieces.length - 1] = last.split(" ")[0];
  }
  const fixed = [];
  for (const part of pieces) {
    const optIdx = part.indexOf(" -");
    if (optIdx >= 0) {
      // case: /aaa/bbb/ccc -c
      fixed.push(part.substring(0, optIdx).trim());
      break;
    } else if (part.endsWith(" ")) {
      // case: node /aaa/bbb/ccc.js
      fixed.push(part.trim());
      break;
    }
    fixed.push(part);
  }
  return fixed.join(path.sep);
}

function fetchName(fullpath) {
  if (process.platform === "darwin") {
    const idx = fullpath.indexOf(".app/");
    if (idx >= 0) {
      return path.basename(fullpath.substring(0, idx));
    }
  }
  return path.basename(fullpath);
}

const finders = {
  darwin(cond) {
    return new Promise((resolve, reject) => {
      let cmd;
      if ("pid" in cond) {
        cmd = `ps -p ${cond.pid} -ww -o pid,ppid,uid,gid,args`;
      } else {
        cmd = "ps ax -ww -o pid,ppid,uid,gid,args";
      }

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if ("pid" in cond) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          err = stderr.toString().trim();
          if (err) {
            reject(err);
            return;
          }

          const data = utils.stripLine(stdout.toString(), 1);
          const columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5).filter((column) => {
            if (column[0] && cond.pid) {
              return column[0] === String(cond.pid);
            } else if (column[4] && cond.name) {
              return matchName(column[4], cond.name);
            } else {
              return !!column[0];
            }
          });

          let list = columns.map((column) => {
            const cmd = String(column[4]);
            const bin = fetchBin(cmd);

            return {
              pid: parseInt(column[0], 10),
              ppid: parseInt(column[1], 10),
              uid: parseInt(column[2], 10),
              gid: parseInt(column[3], 10),
              name: fetchName(bin),
              bin: bin,
              cmd: column[4],
            };
          });

          if (cond.strict && cond.name) {
            list = list.filter((item) => item.name === cond.name);
          }

          resolve(list);
        }
      });
    });
  },
  linux: "darwin",
  sunos: "darwin",
  freebsd: "darwin",
  win32(cond) {
    return new Promise((resolve, reject) => {
      const cmd = "WMIC path win32_process get Name,Processid,ParentProcessId,Commandline,ExecutablePath";
      const lines = [];

      const proc = utils.spawn("cmd", ["/c", cmd], { detached: false, windowsHide: true });
      proc.stdout.on("data", (data) => {
        lines.push(data.toString());
      });
      proc.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error("Command '" + cmd + "' terminated with code: " + code));
        }
        const list = utils
          .parseTable(lines.join("\n"))
          .filter((row) => {
            if ("pid" in cond) {
              return row.ProcessId === String(cond.pid);
            } else if (cond.name) {
              if (cond.strict) {
                return row.Name === cond.name || (row.Name.endsWith(".exe") && row.Name.slice(0, -4) === cond.name);
              } else {
                // fix #9
                return matchName(row.CommandLine || row.Name, cond.name);
              }
            } else {
              return true;
            }
          })
          .map((row) => ({
            pid: parseInt(row.ProcessId, 10),
            ppid: parseInt(row.ParentProcessId, 10),
            // uid: void 0,
            // gid: void 0,
            bin: row.ExecutablePath,
            name: row.Name,
            cmd: row.CommandLine,
          }));
        resolve(list);
      });
    });
  },
};

export function findProcess(cond): any {
  const platform = process.platform;

  return new Promise((resolve, reject) => {
    if (!(platform in finders)) {
      return reject(new Error(`platform ${platform} is unsupported`));
    }

    let find = finders[platform];
    if (typeof find === "string") {
      find = finders[find];
    }

    find(cond).then(resolve, reject);
  });
}
