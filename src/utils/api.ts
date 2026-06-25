import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // CRITICAL: Tells Axios to automatically send cookies (like our HttpOnly refresh token)
  // along with every request made to our backend server origin
  withCredentials: true,
});

// Interceptor to attach the short-lived access token from client memory to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// High-Security 401 Interceptor Loop
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // NOTICE: We do NOT extract a refresh token from localStorage anymore.
        // We simply hit the refresh endpoint, and the browser automatically passes
        // the secure HttpOnly cookie along with the request because of 'withCredentials: true'.
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // The backend returns a freshly rotated access token
        const { accessToken } = response.data;

        // Save the fresh access token back to memory
        localStorage.setItem("accessToken", accessToken);

        // Replay the original failed network request with the new access token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If the HttpOnly refresh cookie is dead or missing, clear the access token and bounce the user
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userProfile");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
