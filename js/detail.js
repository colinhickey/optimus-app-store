import { appFromHash } from "./data.js";
import { library } from "./library.js";
import { runNeuralUpload, runOptimusInstall } from "./install.js";
import {
  closeSheet, compactNumber, escapeHTML, initSheet, isFree, neuralinkSVG, openSheet, reducedMotion, stars, toast,
} from "./ui.js";

const shareSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0 4 4m-4-4L8 7"></path><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></path></svg>`;
const ringSVG = `<svg class="ring" viewBox="0 0 28 28" aria-hidden="true"><circle class="ring-track" cx="14" cy="14" r="11"></circle><circle class="ring-fill" cx="14" cy="14" r="11" pathLength="1"></circle></svg>`;

function installButtonHTML(app, target) {
  const installed = library.get(app.slug)[target];
  if (target === "optimus") {
    return `
      <button type="button" class="install-btn install-optimus" data-install="optimus" data-state="${installed ? "installed" : "idle"}">
        ${ringSVG}
        <span class="install-label">${installed ? "On your Optimus ✓" : "Send to Optimus"}</span>
        ${installed ? "" : `<span class="install-price">${escapeHTML(isFree(app.price) ? "Free" : app.price)}</span>`}
      </button>`;
  }
  return `
    <button type="button" class="install-btn install-neuralink" data-install="neuralink" data-state="${installed ? "installed" : "idle"}" aria-expanded="false" aria-controls="consent">
      ${neuralinkSVG}
      <span class="install-label">${installed ? "In your brain ✓" : "Beam to brain"}</span>
    </button>`;
}

function reviewHTML(review) {
  return `
    <article class="review">
      <div class="review-top">
        <h4>${escapeHTML(review.title)}</h4>
        ${stars(review.rating)}
      </div>
      <p>${escapeHTML(review.body)}</p>
      <span class="review-author">${escapeHTML(review.author)}</span>
    </article>`;
}

function relatedHTML(app) {
  return `
    <button type="button" class="mini-card" data-related="${app.id}">
      <img src="images/${escapeHTML(app.image)}" alt="" loading="lazy" width="1024" height="1024">
      <span class="mini-title">${escapeHTML(app.name)}</span>
      <span class="mini-sub">${escapeHTML(app.category)}${app.neuralink ? ` · ${neuralinkSVG}` : ""}</span>
    </button>`;
}

function detailHTML(app, related) {
  const neuralNote = app.ageRating === "18+" ? "an expanded vocabulary" : "spontaneous humming";
  const info = [
    ["Trained by", app.developer],
    ["Size", app.size],
    ["Category", app.category],
    ["Compatibility", `Optimus Gen 2 or later${app.neuralink ? " · Neuralink N1" : ""}`],
    ["Accessories", app.accessories ?? "None required"],
    ["Age rating", `Robot ${app.ageRating}`],
    ["Price", app.price],
  ];
  return `
    <header class="sheet-hero">
      <img class="sheet-hero-backdrop" src="images/${escapeHTML(app.image)}" alt="" aria-hidden="true">
      <img class="sheet-hero-img" src="images/${escapeHTML(app.image)}" alt="${escapeHTML(app.name)} artwork">
    </header>

    <div class="sheet-head">
      <img class="sheet-icon" src="images/${escapeHTML(app.image)}" alt="" width="1024" height="1024">
      <div class="sheet-titles">
        <p class="sheet-eyebrow">${escapeHTML(app.category)}${app.neuralink ? ` · <span class="nl-inline">${neuralinkSVG}Neuralink ready</span>` : ""}</p>
        <h2 id="sheet-title">${escapeHTML(app.name)}</h2>
        <p class="sheet-subtitle">${escapeHTML(app.subtitle)}</p>
        <p class="sheet-dev">Trained by ${escapeHTML(app.developer)}</p>
      </div>
      <div class="sheet-actions">
        ${installButtonHTML(app, "optimus")}
        ${app.neuralink ? installButtonHTML(app, "neuralink") : ""}
        <button type="button" class="share-btn" data-action="share">${shareSVG}Share</button>
      </div>
    </div>

    ${app.neuralink ? `
    <div class="consent" id="consent" hidden>
      <h3>${neuralinkSVG} Before we begin</h3>
      <ul>
        <li>This skill installs directly into your motor cortex via your N1 implant.</li>
        <li>Side effects may include sudden competence, mild smugness and ${neuralNote}.</li>
        <li>Neural skills cannot be uninstalled. You will simply know things now.</li>
      </ul>
      <label class="check">
        <input type="checkbox" id="consent-check">
        <span>I understand, and I have not had coffee in the last hour</span>
      </label>
      <div class="consent-actions">
        <button type="button" class="text-button" data-action="consent-cancel">Cancel</button>
        <button type="button" class="install-btn install-neuralink" data-action="consent-go" disabled>Begin upload</button>
      </div>
    </div>` : ""}

    <dl class="stats">
      <div><dt>${compactNumber(app.reviewCount)} ratings</dt><dd>${app.rating}</dd><dd class="stat-sub">${stars(app.rating)}</dd></div>
      <div><dt>Age</dt><dd>${escapeHTML(app.ageRating)}</dd><dd class="stat-sub">Robot rating</dd></div>
      <div><dt>Size</dt><dd>${escapeHTML(app.size.split(" ")[0])}</dd><dd class="stat-sub">${escapeHTML(app.size.split(" ")[1] ?? "")}</dd></div>
      <div><dt>Installs to</dt><dd>${app.neuralink ? "2" : "1"}</dd><dd class="stat-sub">${app.neuralink ? "Robot + brain" : "Robot only"}</dd></div>
      <div><dt>Price</dt><dd>${escapeHTML(isFree(app.price) ? "Free" : app.price.split("/")[0])}</dd><dd class="stat-sub">${escapeHTML(app.price.split("/")[1] ? `per ${app.price.split("/")[1]}` : "One-off")}</dd></div>
    </dl>

    <section class="sheet-section">
      <p class="sheet-description">${escapeHTML(app.description)}</p>
    </section>

    <section class="sheet-section">
      <div class="sheet-section-head">
        <h3>What's New</h3>
        <span>Version ${escapeHTML(app.version)} · ${escapeHTML(app.updated)}</span>
      </div>
      <p>${escapeHTML(app.whatsNew)}</p>
    </section>

    <section class="sheet-section">
      <div class="sheet-section-head">
        <h3>Ratings &amp; Reviews</h3>
        <span>${app.reviewCount.toLocaleString()} ratings</span>
      </div>
      <div class="ratings-summary">
        <span class="ratings-big">${app.rating}</span>
        <span>out of 5<br>${stars(app.rating)}</span>
      </div>
      <div class="review-track track">${app.reviews.map(reviewHTML).join("")}</div>
    </section>

    <section class="sheet-section">
      <h3>Information</h3>
      <dl class="info">
        ${info.map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}
      </dl>
    </section>

    ${related.length ? `
    <section class="sheet-section">
      <h3>You Might Also Like</h3>
      <div class="related-track track">${related.map(relatedHTML).join("")}</div>
    </section>` : ""}`;
}

// Same category first, then other Neuralink-ready apps if this one is, then the best rated.
function relatedApps(app, apps) {
  const score = (other) =>
    (other.category === app.category ? 2 : 0) + (app.neuralink && other.neuralink ? 1 : 0) + other.rating / 10;
  return apps.filter((other) => other.id !== app.id).sort((a, b) => score(b) - score(a)).slice(0, 8);
}

export function createDetail({ apps, brain }) {
  const dialog = document.getElementById("app-sheet");
  const body = document.getElementById("sheet-body");
  const confettiCanvas = dialog.querySelector(".sheet-confetti");
  const sheetConfetti = window.confetti?.create(confettiCanvas, { resize: true, useWorker: true });
  const originalImages = apps.slice(0, 7).map((app) => `images/${app.image}`);
  let current = null;
  let source = null; // the card image the sheet morphed from, for the return trip
  let pushedHistory = false;

  initSheet(dialog, body, () => close());

  function render(app) {
    current = app;
    body.innerHTML = detailHTML(app, relatedApps(app, apps));
    body.scrollTop = 0;
  }

  function syncHistory(app) {
    const hash = `#/app/${app.slug}`;
    if (location.hash === hash) return;
    if (dialog.open) {
      history.replaceState({ app: app.slug }, "", hash);
    } else {
      history.pushState({ app: app.slug }, "", hash);
      pushedHistory = true;
    }
  }

  function open(app, { from = null, push = true } = {}) {
    if (push) syncHistory(app);
    const sourceImage = from?.querySelector("img:not(.today-backdrop)");
    const canMorph = document.startViewTransition && sourceImage && !dialog.open && !reducedMotion();

    if (!canMorph) {
      render(app);
      source = null;
      openSheet(dialog);
      return;
    }

    // Shared-element transition: the tapped card's artwork grows into the sheet's hero.
    source = sourceImage;
    sourceImage.style.viewTransitionName = "app-art";
    const transition = document.startViewTransition(() => {
      sourceImage.style.viewTransitionName = "";
      render(app);
      body.querySelector(".sheet-hero-img").style.viewTransitionName = "app-art";
      openSheet(dialog, { animate: false });
    });
    transition.finished.finally(() => {
      const hero = body.querySelector(".sheet-hero-img");
      if (hero) hero.style.viewTransitionName = "";
    });
  }

  function close() {
    const hero = body.querySelector(".sheet-hero-img");
    const sourceVisible = source?.isConnected && (() => {
      const rect = source.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight && rect.width > 0;
    })();

    if (!document.startViewTransition || !sourceVisible || body.scrollTop > 40 || reducedMotion()) {
      return closeSheet(dialog);
    }
    hero.style.viewTransitionName = "app-art";
    const transition = document.startViewTransition(() => {
      hero.style.viewTransitionName = "";
      source.style.viewTransitionName = "app-art";
      dialog.close();
    });
    return transition.finished.finally(() => {
      source.style.viewTransitionName = "";
    });
  }

  dialog.addEventListener("close", () => {
    if (!appFromHash(apps)) return;
    if (pushedHistory) {
      pushedHistory = false;
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
    }
  });

  window.addEventListener("popstate", () => {
    const app = appFromHash(apps);
    if (app && dialog.open) {
      render(app);
    } else if (app) {
      pushedHistory = false;
      open(app, { push: false });
    } else if (dialog.open) {
      pushedHistory = false;
      closeSheet(dialog);
    }
  });

  function celebrate(button) {
    if (!sheetConfetti || reducedMotion()) return;
    const box = dialog.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    sheetConfetti({
      particleCount: 120,
      startVelocity: 32,
      spread: 360,
      origin: {
        x: (rect.left + rect.width / 2 - box.left) / box.width,
        y: (rect.top + rect.height / 2 - box.top) / box.height,
      },
    });
  }

  function refreshButtons() {
    if (!current) return;
    body.querySelectorAll("[data-install]").forEach((button) => {
      button.outerHTML = installButtonHTML(current, button.dataset.install);
    });
  }

  async function share(app) {
    const url = `${location.origin}${location.pathname}#/app/${app.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${app.name} on the Optimus App Store`, text: app.subtitle, url });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast(url);
    }
  }

  body.addEventListener("click", async (event) => {
    const app = current;
    const install = event.target.closest("[data-install]");
    const action = event.target.closest("[data-action]")?.dataset.action;
    const related = event.target.closest("[data-related]");
    const consent = body.querySelector("#consent");

    if (related) {
      const next = apps[related.dataset.related];
      syncHistory(next);
      render(next);
      return;
    }

    if (install?.dataset.install === "optimus") {
      if (install.dataset.state === "installed") {
        toast("Already installed. Manage it in My Optimus.");
      } else if (install.dataset.state === "idle") {
        await runOptimusInstall(install);
        library.set(app.slug, "optimus", true);
        if (current === app) {
          refreshButtons();
          celebrate(body.querySelector('[data-install="optimus"]'));
        }
        toast(`${app.name} is ready on your Optimus`);
      }
      return;
    }

    if (install?.dataset.install === "neuralink") {
      if (install.dataset.state === "installed") {
        toast("Already in your brain. It isn't going anywhere.");
        return;
      }
      consent.hidden = !consent.hidden;
      install.setAttribute("aria-expanded", !consent.hidden);
      if (!consent.hidden) consent.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "nearest" });
      return;
    }

    if (action === "consent-cancel") {
      consent.hidden = true;
      body.querySelector('[data-install="neuralink"]').setAttribute("aria-expanded", "false");
    }

    if (action === "consent-go") {
      await runNeuralUpload({ app, brain, restoreImages: () => brain.setImages(originalImages) });
      library.set(app.slug, "neuralink", true);
      if (current === app) refreshButtons();
      consent.hidden = true;
    }

    if (action === "share") share(app);
  });

  body.addEventListener("change", (event) => {
    if (event.target.id === "consent-check") {
      body.querySelector('[data-action="consent-go"]').disabled = !event.target.checked;
    }
  });

  return { open, close };
}
