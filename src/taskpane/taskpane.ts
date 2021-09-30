import * as runExcel from "./excel";
import * as runOneNote from "./onenote";
import * as runOutlook from "./outlook";
import * as runPowerPoint from "./powerpoint";
import * as runProject from "./project";
import * as runWord from "./word";

// images references in the manifest
import "../../assets/icon-16.png";
import "../../assets/icon-32.png";
import "../../assets/icon-64.png";
import "../../assets/icon-80.png";
import "../../assets/icon-128.png";

/* global document, Office */

Office.onReady((info) => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";

  switch (info.host) {
    case Office.HostType.Excel:
      document.getElementById("run").onclick = runExcel.run;
      break;
    case Office.HostType.OneNote:
      document.getElementById("run").onclick = runOneNote.run;
      break;
    case Office.HostType.Outlook:
      document.getElementById("run").onclick = runOutlook.run;
      break;
    case Office.HostType.PowerPoint:
      document.getElementById("run").onclick = runPowerPoint.run;
      break;
    case Office.HostType.Project:
      document.getElementById("run").onclick = runProject.run;
      break;
    case Office.HostType.Word:
      document.getElementById("run").onclick = runWord.run;
      break;
  }
});
