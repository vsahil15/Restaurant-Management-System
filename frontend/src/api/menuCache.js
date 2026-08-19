import api from './api';

let cachedMenu = null;
let fetchPromise = null;

/**
 * Returns cached menu items if available, or fetches them from API.
 * Deduplicates in-flight requests and provides instant 0ms access across all pages.
 */
export const getCachedMenu = async (forceRefresh = false) => {
  if (cachedMenu && !forceRefresh) {
    return cachedMenu;
  }
  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  fetchPromise = api.get('/menu')
    .then((res) => {
      cachedMenu = res.data.menu || [];
      fetchPromise = null;
      return cachedMenu;
    })
    .catch((err) => {
      fetchPromise = null;
      console.error("Failed to load menu:", err);
      return cachedMenu || [];
    });

  return fetchPromise;
};

/**
 * Synchronous cache lookup for instantaneous 0ms UI component initial state
 */
export const getSyncMenuCache = () => cachedMenu;

/**
 * Update cache when menu items are added, modified or refreshed
 */
export const updateMenuCache = (items) => {
  cachedMenu = items;
};
