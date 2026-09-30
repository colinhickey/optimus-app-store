import { library } from "./library.js";
import { closeSheet, escapeHTML, initSheet, neuralinkSVG, openSheet, sizeInTB, toast } from "./ui.js";

const OPTIMUS_CAPACITY_TB = 64;

function rowHTML(app, target) {
  return `
    <li class="library-row">
      <button type="button" class="library-open" data-open="${app.id}">
        <img src="images/${escapeHTML(app.image)}" alt="" width="1024" height="1024">
        <span>
          <b>${escapeHTML(app.name)}</b>
          <small>${escapeHTML(target === "optimus" ? app.size : `Can ${app.neuralSkill}`)}</small>
        </span>
      </button>
      <button type="button" class="text-button" data-uninstall="${target}" data-slug="${app.slug}">Uninstall</button>
    </li>`;
}

export function initLibraryPanel({ apps, openApp }) {
  const button = document.getElementById("library-button");
  const badge = document.getElementById("library-badge");
  const dialog = document.getElementById("library-sheet");
  const body = document.getElementById("library-body");
  const bySlug = (slug) => apps.find((app) => app.slug === slug);

  initSheet(dialog, body);

  function render() {
    const onOptimus = library.list("optimus").map(bySlug).filter(Boolean);
    const inBrain = library.list("neuralink").map(bySlug).filter(Boolean);
    const used = onOptimus.reduce((total, app) => total + sizeInTB(app.size), 0);

    body.innerHTML = `
      <div class="library-head">
        <p class="sheet-eyebrow">Your robot, your brain</p>
        <h2 id="library-title">My Optimus</h2>
      </div>

      <section class="library-section">
        <div class="storage">
          <div class="storage-row"><span>Optimus storage</span><span>${used.toFixed(1)} TB of ${OPTIMUS_CAPACITY_TB} TB</span></div>
          <div class="storage-bar"><i style="transform: scaleX(${Math.min(1, used / OPTIMUS_CAPACITY_TB)})"></i></div>
        </div>
        <h3>On your Optimus <span class="count">${onOptimus.length}</span></h3>
        ${onOptimus.length
          ? `<ul class="library-list">${onOptimus.map((app) => rowHTML(app, "optimus")).join("")}</ul>`
          : `<p class="library-empty">Nothing installed yet. Your Optimus is currently just standing there, waiting.</p>`}
      </section>

      <section class="library-section library-brain">
        <div class="storage">
          <div class="storage-row"><span>${neuralinkSVG} Brain capacity</span><span>~2.5 PB (est.)</span></div>
          <div class="storage-bar"><i style="transform: scaleX(0.97)"></i></div>
          <p class="storage-note">97% used, mostly by song lyrics from 2004.</p>
        </div>
        <h3>In your brain <span class="count">${inBrain.length}</span></h3>
        ${inBrain.length
          ? `<ul class="library-list">${inBrain.map((app) => rowHTML(app, "neuralink")).join("")}</ul>`
          : `<p class="library-empty">No neural skills yet. Look for the Neuralink badge.</p>`}
      </section>`;
  }

  function updateBadge() {
    const count = new Set([...library.list("optimus"), ...library.list("neuralink")]).size;
    badge.hidden = count === 0;
    badge.textContent = count;
    button.setAttribute("aria-label", `My Optimus: ${count ? `${count} skill${count === 1 ? "" : "s"} installed` : "no skills installed"}`);
  }

  button.addEventListener("click", () => {
    render();
    openSheet(dialog);
  });

  body.addEventListener("click", async (event) => {
    const open = event.target.closest("[data-open]");
    const uninstall = event.target.closest("[data-uninstall]");

    if (open) {
      await closeSheet(dialog);
      openApp(apps[open.dataset.open]);
    }

    if (uninstall?.dataset.uninstall === "optimus") {
      const app = bySlug(uninstall.dataset.slug);
      library.set(app.slug, "optimus", false);
      toast(`Uninstalled. Your Optimus has forgotten all about ${app.name}.`);
    }

    if (uninstall?.dataset.uninstall === "neuralink") {
      toast("Neural skills can't be uninstalled. You'll just have to live with knowing things.");
    }
  });

  library.subscribe(() => {
    updateBadge();
    if (dialog.open) render();
  });
  updateBadge();
}
