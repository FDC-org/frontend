function getCookie() {
  const name = "csrf_token";
  const cookieStr = document.cookie;
  const cookies = cookieStr ? cookieStr.split("; ") : [];
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

export default getCookie;
