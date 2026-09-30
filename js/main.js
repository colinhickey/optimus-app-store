import { createBrain } from "./brain.js";
import { initIntro } from "./intro.js";
import { initStore } from "./store.js";

// Shared links to an app skip straight to the store.
if (location.hash.startsWith("#/app/")) {
  try { sessionStorage.setItem("optimus-intro-seen", "1"); } catch {}
}

const brain = createBrain(document.getElementById("brain"));

initStore(brain);
initIntro(brain);
