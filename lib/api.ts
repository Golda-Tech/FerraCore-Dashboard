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
      const requestUrl = error.config?.url || "";

      // These endpoints handle their own errors in the UI — never force a login redirect
      const businessEndpoints = [
        "name-enquiry",
        "recurring-payments",
        "payment/request",
        "collections",
        "installment",
        "authorize-otp",
        "resend-otp",
        "subscriptions",
      ];
      const isBusinessEndpoint = businessEndpoints.some((ep) =>
        requestUrl.includes(ep)
      );

      const status = error.response?.status;
      const message =
        (error.response?.data?.message || error.response?.data?.error || "")
          .toLowerCase();

      // Only treat as a true auth/token error when the message explicitly
      // references a token problem — not generic "invalid" business errors.
      const isTokenError =
        message.includes("invalid token") ||
        message.includes("expired token") ||
        message.includes("jwt expired") ||
        message.includes("token expired") ||
        message.includes("invalid/expired token");

      // Redirect to login only for genuine token issues on non-business endpoints,
      // OR if status is 401 on a non-business endpoint (likely a session expiry).
      if (!isBusinessEndpoint && (isTokenError || status === 401)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
