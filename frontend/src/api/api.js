import axios from 'axios';

// In-memory storage for access token (not accessible via XSS)
let inMemoryToken = null;

export const setAccessToken = (token) => {
  inMemoryToken = token;
};

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies automatically with every request
});

// Request interceptor to add bearer token from memory
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip interceptor for auth/refresh requests to avoid infinite loops
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    
    // Check if error is 401 Unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token — browser sends the httpOnly cookie automatically
        const response = await axios.post(
          'http://localhost:3000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        
        const { accessToken: newAccessToken } = response.data;
        
        // Save the new access token in memory
        setAccessToken(newAccessToken);
        
        // Update the authorization header for the original request and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid, clear state and redirect
        setAccessToken(null);
        localStorage.removeItem('user');
        // Only redirect if not already on login page (prevents infinite reload)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
