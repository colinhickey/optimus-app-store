import { appsPromise } from "./data.js";

const neuralinkSVG = `<svg class="neuralink-icon" viewBox="0 0 56 35" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M30.8777 22.4886H0.705078L22.5011 2.28693C24.3585 0.565492 27.0293 -0.000275522 29.47 0.809903C31.9102 1.62058 33.6439 3.6498 33.994 6.10498L37.476 30.5019C37.5803 31.2306 38.0767 31.8049 38.8036 32.0367C39.5305 32.2696 40.2868 32.0946 40.8255 31.572L50.1712 22.4886H39.4676L39.1096 20.2688H55.7051L42.4717 33.131C41.6499 33.9302 40.5593 34.3566 39.4367 34.3566C38.9823 34.3566 38.5221 34.2862 38.073 34.1429C36.5143 33.6455 35.4074 32.3656 35.1842 30.8031L31.7021 6.40672C31.4673 4.75921 30.3499 3.45166 28.7127 2.90802C27.0759 2.36337 25.3548 2.72899 24.108 3.88365L6.42923 20.2688H30.5522L30.8777 22.4886Z"></path></svg>`;

const NEURALINK_FILTER = "Neuralink";

const SHELVES = [
  {
    title: "Editor's Picks",
    subtitle: "Hand-picked by our editors, who are, for now, still human",
    filter: (app) => app.editorsPick,
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
    title: "Looking After People",
    subtitle: "Care, companionship and a spoonful of sugar",
    filter: (app) => app.category === "Care",
  },
  {
    title: "For the Professionals",
    subtitle: "Augment your workforce. Or replace it.",
    filter: (app) => ["Pro", "Science", "Transport"].includes(app.category),
  },
];

const SORTS = {
  featured: () => 0,
  rating: (a, b) => b.rating - a.rating,
  "price-asc": (a, b) => priceValue(a.price) - priceValue(b.price),
  "price-desc": (a, b) => priceValue(b.price) - priceValue(a.price),
  name: (a, b) => a.name.localeCompare(b.name),
};

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "$50k/month" -> 50000. Billing period is ignored; good enough for sorting.
function priceValue(price) {
  const match = /\$([\d.]+)(k)?/i.exec(price);
  if (!match) return 0;
  return parseFloat(match[1]) * (match[2] ? 1000 : 1);
}

const priceLabel = (price) => (/free/i.test(price) ? "Get" : price);

function cardHTML(app) {
  return `
    <button type="button" class="card" data-id="${app.id}">
      <span class="card-media">
        <img src="images/${escapeHTML(app.image)}" alt="" loading="lazy" width="1024" height="1024">
        ${app.neuralink ? `<span class="nl-badge">${neuralinkSVG}Neuralink</span>` : ""}
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

export function initStore() {
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

  const modal = document.getElementById('modal');
  const closeModalButton = document.getElementById('close-modal');
  const closeModalMobile = document.getElementById('close-modal-mobile');
  const modalImage = document.getElementById('modal-image');
  const modalName = document.getElementById('modal-name');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalDescription = document.getElementById('modal-description');
  const modalCategory = document.getElementById('modal-category');
  const modalRating = document.getElementById('modal-rating');
  const modalPrice = document.getElementById('modal-price');
  const modalAccessories = document.getElementById('modal-accessories');
  const modalOptimusButton = document.getElementById('optimus-button');
  const modalNeuralinkButton = document.getElementById('neuralink-button');
  const neuralinkOverlay = document.getElementById('neuralink-overlay');
  const neuralinkAnimation = document.getElementById('neuralink-animation');
  const installMessage = document.getElementById('neuralink-install-message');

  const filters = { query: "", category: "All", sort: "featured" };
  let apps = [];
  let lastFocus = null;

  function openModal(app) {
    lastFocus = document.activeElement;
    modalImage.src = `images/${app.image}`;
    modalName.textContent = app.name;
    modalSubtitle.textContent = app.subtitle;
    modalDescription.textContent = app.description;
    modalCategory.textContent = app.category;
    modalRating.textContent = `${app.rating} ⭐`;
    modalPrice.textContent = app.price;
    modalAccessories.textContent = `Accessories: ${app?.accessories ?? 'None'}`;
    modalNeuralinkButton.classList.toggle('hidden', !app.neuralink);
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    closeModalButton.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    lastFocus?.focus({ preventScroll: true });
  }

  function fireConfetti(event) {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      origin: { x, y },
      zIndex: 20000
    });
  }

  function startNeuralinkAnimation() {
    neuralinkOverlay.classList.remove('hidden');
    neuralinkOverlay.classList.add('show');
    installMessage.classList.remove('hidden');
    installMessage.classList.add('show');

    // Create glowing circles
    for (let i = 0; i < 5; i++) {
      const circle = document.createElement('div');
      circle.className = 'glowing-circle';
      circle.style.animationDelay = `${i * 0.5}s`;
      neuralinkAnimation.appendChild(circle);
    }

    // Hide the overlay and remove the glowing circles after 4 seconds
    setTimeout(() => {
      neuralinkOverlay.classList.remove('show');
      neuralinkOverlay.classList.add('hidden');
      neuralinkAnimation.innerHTML = '';
      installMessage.classList.remove('show');
      installMessage.classList.add('hidden');
    }, 4000);
  }

  function renderToday() {
    document.getElementById("today-date").textContent = new Date()
      .toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const featured = apps.filter((app) => app.featured);
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
    if (target) openModal(apps[target.dataset.id]);
  });
  enableTilt(store);

  appsPromise.then((data) => {
    apps = data.map((app, id) => ({ ...app, id }));
    renderToday();
    renderChips();
    renderShelves();
    update();
  });

  modalOptimusButton.addEventListener('click', fireConfetti);
  modalNeuralinkButton.addEventListener('click', startNeuralinkAnimation);
  closeModalButton.addEventListener('click', closeModal);
  closeModalMobile.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}
