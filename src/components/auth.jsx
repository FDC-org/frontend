import getCookie from "./getCookies";
import Cookies from "js-cookie";

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  // const csrf_token = getCookie();

  return !!token;
};

export const logout = () => {
  localStorage.clear();

  // Clear all cookies
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }

  // Redirect to login
  window.location.href = "/login";
};
