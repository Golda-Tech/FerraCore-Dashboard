import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle invalid/expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const message =
        (error.response?.data?.message || error.response?.data?.error || "")
          .toLowerCase();

      const isAuthError =
        status === 401 ||
        status === 403 ||
        message.includes("invalid token") ||
        message.includes("expired token") ||
        message.includes("jwt expired") ||
        message.includes("token expired") ||
        message.includes("invalid/expired");

      if (isAuthError) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export default api;
