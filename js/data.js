export const slugify = (name) =>
  name.toLowerCase().replace(/[™'’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Single shared fetch of the app catalogue, with a stable id and URL slug per app.
export const appsPromise = fetch("data.json")
  .then((response) => response.json())
  .then((data) => data.apps.map((app, id) => ({ ...app, id, slug: slugify(app.name) })));

export const appFromHash = (apps, hash = location.hash) => {
  const match = /^#\/app\/([\w-]+)/.exec(hash);
  return match ? apps.find((app) => app.slug === match[1]) : null;
};
