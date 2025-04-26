import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create a base API instance
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid
      localStorage.removeItem("token");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Export typed request methods
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(url, config).then((response) => response.data);
  },

  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return api.post(url, data, config).then((response) => response.data);
  },

  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return api.put(url, data, config).then((response) => response.data);
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete(url, config).then((response) => response.data);
  },

  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return api.patch(url, data, config).then((response) => response.data);
  },
};
