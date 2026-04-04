/**
 * Centralized configuration for the application
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

export const APP_CONFIG = {
  name: 'Numo',
  version: '1.0.0',
};

export default {
  api: API_CONFIG,
  app: APP_CONFIG,
};
