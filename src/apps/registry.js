// =====================================================================
//  REGISTRY — the list of installed apps. Adding an app means writing
//  its module and adding it here; the desktop icon and the Start menu
//  entry then come from config/desktop.js.
// =====================================================================

import {
  aboutApp, workApp, projectsApp, skillsApp,
  educationApp, resumeApp, contactApp
} from "./resume-apps.js";
import { notepadApp } from "./notepad.js";
import { paintApp } from "./paint.js";
import { auditApp } from "./audit.js";
import { galleryApp } from "./gallery.js";
import { displayApp } from "./display.js";
import { timeMachineApp } from "./timemachine.js";
import { assistantApp } from "./assistant.js";
import { openWindow } from "../os/wm.js";

export const apps = {
  about: aboutApp,
  work: workApp,
  projects: projectsApp,
  skills: skillsApp,
  education: educationApp,
  gallery: galleryApp,
  resume: resumeApp,
  contact: contactApp,
  notepad: notepadApp,
  paint: paintApp,
  audit: auditApp,
  display: displayApp,
  timemachine: timeMachineApp,
  assistant: assistantApp
};

export function launch(name) {
  const app = apps[name];
  if (!app) return;
  openWindow(app);
}
