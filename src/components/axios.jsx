// import axios from "axios";
// import Cookies from "js-cookie";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_LINK,
//   withCredentials: true,
//   headers: {
//     Authorization: "Token " + localStorage.getItem("token"),

//   },
// });

// axiosInstance.interceptors.request.use((config) => {
//   const csrf_token = Cookies.get('csrf_token');
//   if (csrf_token) config.headers["X-CSRFToken"] = csrf_token;
//   return config;
// });

// export default axiosInstance

import axios from "axios";
import Cookies from "js-cookie";
import { logout } from "./auth";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_LINK,
  withCredentials: true,
});

// 🔹 REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = "Token " + token;
    }

    const csrf_token = Cookies.get("csrf_token");
    if (csrf_token) {
      config.headers["X-CSRFToken"] = csrf_token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🔹 RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;

    // Robust check for invalid/expired tokens in successful responses (2xx)
    const errorMsg = (
      data?.status ||
      data?.error ||
      data?.detail ||
      ""
    ).toLowerCase();

    if (
      errorMsg.includes("invalid token") ||
      errorMsg.includes("token expired") ||
      errorMsg === "invalid" ||
      errorMsg === "error"
    ) {
      logout();
      return Promise.reject(
        new Error(data.error || data.status || data.detail || "Invalid session"),
      );
    }

    // If backend sends new token
    if (data?.new_token) {
      localStorage.setItem("token", data.new_token);
    }

    return response;
  },
  (error) => {
    const isNetworkError = error.message === "Network Error";
    const hasToken = !!localStorage.getItem("token");

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const errorMsg = (data?.error || data?.status || data?.detail || "").toLowerCase();

      if (
        status === 401 ||
        errorMsg.includes("invalid token") ||
        errorMsg.includes("token expired") ||
        errorMsg === "invalid"
      ) {
        logout();
      }

      if (status === 403) {
        alert("Access Denied: You do not have permission to perform this action.");
      }
    } else if (isNetworkError && hasToken) {
      // Potentially a CORS-blocked 401 error
      // In many cases, if a request fails with Network Error while we have a token,
      // it might be due to a 401 that lacks CORS headers.
      // We can check /verify_token or just logout if it's persistent.
      // For now, let's trigger logout to be safe if the user is stuck.
      console.warn("Possible CORS-blocked 401 detected. Logging out.");
      logout();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
