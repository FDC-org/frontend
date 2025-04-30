import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_LINK,
  withCredentials: true,
  headers: {
    Authorization: "Token " + localStorage.getItem("token"),
    
  },
});

axiosInstance.interceptors.request.use((config) => {
  const csrf_token = Cookies.get('csrf_token');
  if (csrf_token) config.headers["X-CSRFToken"] = csrf_token;
  return config;
});

export default axiosInstance