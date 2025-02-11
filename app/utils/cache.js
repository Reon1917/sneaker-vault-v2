const CACHE_PREFIX = 'sneaker_vault_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getCachedData = (key) => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const { value, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return value;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

export const setCachedData = (key, value) => {
  try {
    const item = {
      value,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

export const clearCache = () => {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}; 