// Single shared fetch of the app catalogue.
export const appsPromise = fetch("data.json")
  .then((response) => response.json())
  .then((data) => data.apps);
