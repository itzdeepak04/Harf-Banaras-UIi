import axios from 'axios';
import { environment } from '../environments/environment';
import { clearStoredSession, getStoredToken } from '../shared/shared-functions';

/**
 * Central Axios instance, mirroring the reference project's
 * config/axios.config.ts. Every request automatically gets the JWT
 * attached. On a 401 response the stored session is cleared so the
 * user is treated as logged out.
 */
// Ensure baseURL always ends with a slash so Axios doesn't strip the path
const formattedBaseUrl = environment.API_URL.endsWith('/') 
  ? environment.API_URL 
  : `${environment.API_URL}/`;

const API = axios.create({
  baseURL: formattedBaseUrl
});

API.interceptors.request.use((config) => {
  // Axios strips the path from baseURL if the request url starts with a slash.
  // We remove the leading slash so it perfectly appends to our baseURL (which has a trailing slash).
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredSession();
    }
    return Promise.reject(error);
  }
);

export default API;
