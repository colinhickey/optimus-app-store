// Installed skills, per app slug: { optimus: true, neuralink: true }. Persisted per browser.
const KEY = "optimus-installs";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

let installs = load();
const listeners = new Set();

export const library = {
  get: (slug) => installs[slug] ?? {},

  isInstalled: (slug) => Object.values(installs[slug] ?? {}).some(Boolean),

  set(slug, target, installed) {
    const entry = { ...installs[slug], [target]: installed };
    installs = { ...installs, [slug]: entry };
    if (!Object.values(entry).some(Boolean)) delete installs[slug];
    try {
      localStorage.setItem(KEY, JSON.stringify(installs));
    } catch {}
    listeners.forEach((listener) => listener());
  },

  list: (target) => Object.keys(installs).filter((slug) => installs[slug][target]),

  subscribe: (listener) => listeners.add(listener),
};
