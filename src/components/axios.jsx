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
    // If backend sends new token
    if (response.data?.new_token) {
      localStorage.setItem("token", response.data.new_token);
    }

    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (
        status === 401 ||
        data?.error === "invalid token" ||
        data?.error === "token expired"
      ) {
        // 🔥 Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("type");
        localStorage.removeItem("hubname");
        localStorage.removeItem("user");

        // Redirect to login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
