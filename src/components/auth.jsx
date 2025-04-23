import getCookie from "./getCookies";

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");  
  const csrf_token = getCookie()
  
  return !!token & !!csrf_token;
};

