// src/utils/cache.js
class FrontendCache {
    constructor() {
      this.cache = {};
      this.maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }
  
    get(key) {
      const item = this.cache[key];
      if (!item) return null;
      
      // Check if cache is expired
      if (Date.now() - item.timestamp > this.maxAge) {
        delete this.cache[key];
        return null;
      }
      
      return item.data;
    }
  
    set(key, data) {
      this.cache[key] = {
        data,
        timestamp: Date.now()
      };
    }
  
    clear(key) {
      if (key) {
        delete this.cache[key];
      } else {
        this.cache = {};
      }
    }
  }
  
  export const frontendCache = new FrontendCache();