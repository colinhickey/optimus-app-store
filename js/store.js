import { appFromHash, appsPromise } from "./data.js";
import { createDetail } from "./detail.js";
import { initNeuralOverlay } from "./install.js";
import { library } from "./library.js";
import { initLibraryPanel } from "./library-panel.js";
import { escapeHTML, neuralinkSVG, priceLabel } from "./ui.js";

const NEURALINK_FILTER = "Neuralink";

const SHELVES = [
  {
    title: "Editor's Picks",
    subtitle: "Hand-picked by our editors, who are, for now, still human",
    filter: (app) => app.editorsPick,
  },
  {
    title: "New This Week",
    subtitle: "Fresh skills, straight off the training cluster",
    filter: (app) => app.isNew,
  },
  {
    title: "Neuralink Ready",
    subtitle: "Install on your Optimus, or straight into your own brain",
    filter: (app) => app.neuralink,
    accent: true,
  },
  {
    type: "chart",
    title: "Top Charts",
    subtitle: "The highest rated skills this week",
    list: (apps) => [...apps].sort((a, b) => b.rating - a.rating).slice(0, 9),
  },
  {
    title: "Around the Home",
    subtitle: "Hand over the chores you never wanted",
    filter: (app) => ["Household", "Pets", "Food & Drink", "Security"].includes(app.category),
  },
  {
    title: "Weekends Sorted",
    subtitle: "Sport, games, errands and a better first dance",
    filter: (app) => ["Sport & Leisure", "Entertainment", "Out & About"].includes(app.category),
  },
  {
    title: "Looking After People",
    subtitle: "Care, companionship and a spoonful of sugar",
    filter: (app) => app.category === "Care",
  },
  {
    title: "For the Professionals",
    subtitle: "Augment your workforce. Or replace it.",
    filter: (app) => ["Pro", "Science"].includes(app.category),
  },
];

const SORTS = {
  featured: () => 0,
  rating: (a, b) => b.rating - a.rating,
  "price-asc": (a, b) => priceValue(a.price) - priceValue(b.price),
  "price-desc": (a, b) => priceValue(b.price) - priceValue(a.price),
  name: (a, b) => a.name.localeCompare(b.name),
};

// "$50k/month" -> 50000. Billing period is ignored; good enough for sorting.
function priceValue(price) {
  const match = /\$([\d.]+)(k)?/i.exec(price);
  if (!match) return 0;
  return parseFloat(match[1]) * (match[2] ? 1000 : 1);
}

function cardHTML(app) {
  return `
    <button type="button" class="card" data-id="${app.id}">
      <span class="card-media">
        <img src="images/${escapeHTML(app.image)}" alt="" loading="lazy" width="1024" height="1024">
        ${app.neuralink ? `<span class="nl-badge">${neuralinkSVG}Neuralink</span>` : ""}
        ${app.isNew ? `<span class="new-badge">New</span>` : ""}
      </span>
      <span class="card-body">
        <span class="card-title">${escapeHTML(app.name)}</span>
        <span class="card-subtitle">${escapeHTML(app.subtitle)}</span>
        <span class="card-meta">
          <span class="card-rating"><span aria-hidden="true">★</span> ${app.rating}</span>
          <span class="card-category">${escapeHTML(app.category)}</span>
          <span class="price-pill">${escapeHTML(priceLabel(app.price))}</span>
        </span>
      </span>
    </button>`;
}

function rankRowHTML(app, rank) {
  return `
    <button type="button" class="rank-row" data-id="${app.id}">
      <span class="rank">${rank}</span>
      <img src="images/${escapeHTML(app.image)}" alt="" loading="lazy" width="1024" height="1024">
      <span class="rank-text">
        <span class="rank-title"><span>${escapeHTML(app.name)}</span>${app.neuralink ? neuralinkSVG : ""}</span>
        <span class="rank-subtitle">${escapeHTML(app.subtitle)}</span>
        <span class="card-rating"><span aria-hidden="true">★</span> ${app.rating}</span>
      </span>
      <span class="price-pill">${escapeHTML(priceLabel(app.price))}</span>
    </button>`;
}

function todayCardHTML(app) {
  return `
    <button type="button" class="today-card" data-id="${app.id}">
      <img class="today-backdrop" src="images/${escapeHTML(app.image)}" alt="" aria-hidden="true">
      <img class="today-image" src="images/${escapeHTML(app.image)}" alt="">
      <span class="today-content">
        <span class="today-eyebrow">${escapeHTML(app.featured.eyebrow)}</span>
        <span class="today-headline">${escapeHTML(app.featured.headline)}</span>
        <span class="today-app">
          <img src="images/${escapeHTML(app.image)}" alt="" width="1024" height="1024">
          <span class="today-app-text">
            <b>${escapeHTML(app.name)}</b>
            <small>${escapeHTML(app.subtitle)}</small>
          </span>
          <span class="price-pill">${escapeHTML(priceLabel(app.price))}</span>
        </span>
      </span>
    </button>`;
}

function shelfHTML(shelf, apps, index) {
  const body = shelf.type === "chart"
    ? `<div class="chart-track track">${apps.map((app, i) => rankRowHTML(app, i + 1)).join("")}</div>`
    : `<div class="shelf-track track">${apps.map(cardHTML).join("")}</div>`;
  return `
    <section class="shelf wrap${shelf.accent ? " shelf-accent" : ""}" aria-labelledby="shelf-${index}">
      <div class="section-head">
        <div>
          <h2 id="shelf-${index}">${escapeHTML(shelf.title)}</h2>
          <p>${escapeHTML(shelf.subtitle)}</p>
        </div>
        <div class="nav-buttons">
          <button type="button" class="nav-button" data-scroll="-1" aria-label="Scroll ${escapeHTML(shelf.title)} left">‹</button>
          <button type="button" class="nav-button" data-scroll="1" aria-label="Scroll ${escapeHTML(shelf.title)} right">›</button>
        </div>
      </div>
      ${body}
    </section>`;
}

// Enable/disable a track's arrow buttons depending on where it's scrolled to.
function syncNavButtons(track, prev, next) {
  const max = track.scrollWidth - track.clientWidth - 2;
  prev.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= max;
}

// Desktop only: cards tilt towards the pointer and a glow follows it.
function enableTilt(root) {
  const canTilt = matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canTilt) return;
  root.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    card.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
  });
  root.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".card");
    if (card && !card.contains(event.relatedTarget)) {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    }
  });
}

export function initStore(brain) {
  const store = document.getElementById("store");
  const todayTrack = document.getElementById("today-track");
  const todayDots = document.getElementById("today-dots");
  const todayPrev = document.getElementById("today-prev");
  const todayNext = document.getElementById("today-next");
  const toolbarAnchor = document.getElementById("toolbar-anchor");
  const search = document.getElementById("search");
  const chips = document.getElementById("chips");
  const sort = document.getElementById("sort");
  const shelves = document.getElementById("shelves");
  const results = document.getElementById("results");
  const resultsTitle = document.getElementById("results-title");
  const resultsCount = document.getElementById("results-count");
  const resultsGrid = document.getElementById("results-grid");
  const resultsEmpty = document.getElementById("results-empty");
  const clearFilters = document.getElementById("clear-filters");

  const filters = { query: "", category: "All", sort: "featured" };
  let apps = [];
  let detail;

  function renderToday() {
    document.getElementById("today-date").textContent = new Date()
      .toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    // New launches lead the carousel.
    const featured = apps.filter((app) => app.featured).sort((a, b) => Boolean(b.isNew) - Boolean(a.isNew));
    todayTrack.innerHTML = featured.map(todayCardHTML).join("");
    todayDots.innerHTML = featured
      .map((app, i) => `<button type="button" aria-label="Show ${escapeHTML(app.name)}" data-index="${i}"></button>`)
      .join("");

    const cards = [...todayTrack.children];
    const dots = [...todayDots.children];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = cards.indexOf(entry.target);
          dots.forEach((dot, i) => dot.setAttribute("aria-current", i === index));
        }
      });
    }, { root: todayTrack, threshold: 0.6 });
    cards.forEach((card) => observer.observe(card));

    todayDots.addEventListener("click", (event) => {
      const index = event.target.dataset.index;
      if (index !== undefined) todayTrack.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: "smooth" });
    });
    todayPrev.addEventListener("click", () => todayTrack.scrollBy({ left: -cards[0].offsetWidth, behavior: "smooth" }));
    todayNext.addEventListener("click", () => todayTrack.scrollBy({ left: cards[0].offsetWidth, behavior: "smooth" }));
    todayTrack.addEventListener("scroll", () => syncNavButtons(todayTrack, todayPrev, todayNext), { passive: true });
    syncNavButtons(todayTrack, todayPrev, todayNext);
  }

  function renderShelves() {
    shelves.innerHTML = SHELVES.map((shelf, i) => {
      const list = shelf.list ? shelf.list(apps) : apps.filter(shelf.filter);
      return list.length ? shelfHTML(shelf, list, i) : "";
    }).join("");

    shelves.querySelectorAll(".shelf").forEach((shelf) => {
      const track = shelf.querySelector(".track");
      const [prev, next] = shelf.querySelectorAll(".nav-button");
      const step = () => track.clientWidth * 0.8;
      prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
      track.addEventListener("scroll", () => syncNavButtons(track, prev, next), { passive: true });
      syncNavButtons(track, prev, next);
    });
  }

  function renderChips() {
    const counts = apps.reduce((acc, app) => ({ ...acc, [app.category]: (acc[app.category] ?? 0) + 1 }), {});
    const categories = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    chips.innerHTML = ["All", NEURALINK_FILTER, ...categories]
      .map((category) => `
        <button type="button" class="chip${category === NEURALINK_FILTER ? " chip-neuralink" : ""}" data-category="${escapeHTML(category)}" aria-pressed="${category === filters.category}">
          ${category === NEURALINK_FILTER ? neuralinkSVG : ""}${escapeHTML(category)}
        </button>`)
      .join("");
  }

  function matches(app) {
    if (filters.category === NEURALINK_FILTER && !app.neuralink) return false;
    if (![ "All", NEURALINK_FILTER ].includes(filters.category) && app.category !== filters.category) return false;
    if (!filters.query) return true;
    const haystack = [app.name, app.subtitle, app.description, app.category, app.accessories].join(" ").toLowerCase();
    return filters.query.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
  }

  function update() {
    const browsing = filters.query || filters.category !== "All" || filters.sort !== "featured";
    shelves.hidden = browsing;
    results.hidden = !browsing;
    chips.querySelectorAll(".chip").forEach((chip) => chip.setAttribute("aria-pressed", chip.dataset.category === filters.category));
    if (!browsing) return;

    const list = apps.filter(matches).sort(SORTS[filters.sort]);
    resultsTitle.textContent = filters.query
      ? `“${filters.query}”`
      : filters.category === "All" ? "All skills" : filters.category === NEURALINK_FILTER ? "Neuralink Ready" : filters.category;
    resultsCount.textContent = `${list.length} ${list.length === 1 ? "skill" : "skills"}`;
    resultsGrid.innerHTML = list.map(cardHTML).join("");
    resultsEmpty.hidden = list.length > 0;
    refreshPills();
  }

  // Once the toolbar is stuck, keep results starting just beneath it rather than leaving the viewer mid-page.
  function scrollToResults() {
    const headerHeight = document.getElementById("header").offsetHeight;
    const restingTop = toolbarAnchor.getBoundingClientRect().bottom + window.scrollY - headerHeight;
    if (window.scrollY > restingTop) window.scrollTo({ top: restingTop });
  }

  chips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    filters.category = chip.dataset.category;
    update();
    scrollToResults();
  });
  search.addEventListener("input", () => {
    filters.query = search.value.trim();
    update();
  });
  sort.addEventListener("change", () => {
    filters.sort = sort.value;
    update();
    scrollToResults();
  });
  clearFilters.addEventListener("click", () => {
    Object.assign(filters, { query: "", category: "All", sort: "featured" });
    search.value = "";
    sort.value = "featured";
    update();
    scrollToResults();
  });

  store.addEventListener("click", (event) => {
    const target = event.target.closest("[data-id]");
    if (target) detail.open(apps[target.dataset.id], { from: target });
  });
  enableTilt(store);

  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  document.getElementById("back-to-store").addEventListener("click", (event) => {
    event.preventDefault();
    const headerHeight = document.getElementById("header").offsetHeight;
    window.scrollTo({ top: toolbarAnchor.getBoundingClientRect().bottom + window.scrollY - headerHeight, behavior: smooth() });
  });
  document.getElementById("replay-intro").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: smooth() });
  });

  // Price pills read "Installed" once a skill is on the robot.
  function refreshPills() {
    store.querySelectorAll("[data-id]").forEach((el) => {
      const app = apps[el.dataset.id];
      const pill = el.querySelector(".price-pill");
      const installed = library.isInstalled(app.slug);
      pill.textContent = installed ? "Installed" : priceLabel(app.price);
      pill.classList.toggle("installed", installed);
    });
  }

  appsPromise.then((data) => {
    apps = data;
    detail = createDetail({ apps, brain });
    initLibraryPanel({ apps, openApp: (app) => detail.open(app) });
    initNeuralOverlay();
    renderToday();
    renderChips();
    renderShelves();
    update();
    refreshPills();
    library.subscribe(refreshPills);

    const linked = appFromHash(apps);
    if (linked) detail.open(linked, { push: false });
  });
}
