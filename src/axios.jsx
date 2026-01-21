// src/axios.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE_URL = "https://api3.aldonlinelive.com";
const SYNC_BASE_URL = "https://sync.aldonlinelive.com";

const API_KEY = "MJCET160420737055";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY, // always sent
  },
});
// 🔹 Attach sync base dynamically
api.sync = axios.create({
  baseURL: SYNC_BASE_URL,
  timeout: 1000000, // sync jobs are heavy
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ✅ REQUEST INTERCEPTOR
 * - Adds Firebase auth token if user is logged in
 * - Does NOTHING if user is not logged in
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Optional device binding
      const deviceId = localStorage.getItem("deviceId");
      if (deviceId) {
        config.headers["x-device-id"] = deviceId;
      }

      return config;
    } catch (error) {
      console.warn("Auth token attach failed:", error);
      return config; // ❗ do NOT block request
    }
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ RESPONSE INTERCEPTOR
 * Centralized error handling
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      "API Error:",
      err.response?.status,
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export default api;
