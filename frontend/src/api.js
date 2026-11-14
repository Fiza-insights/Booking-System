const TOKEN_KEY = "db_token";
const USER_KEY = "db_user";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}

export function getUser() {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (e) { return null; }
}

export function saveLogin(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) { /* storage not available */ }
}

export function clearLogin() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) { /* storage not available */ }
}

export async function api(path, options) {
  const opts = options || {};
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  let res;
  try {
    res = await fetch("/api" + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
  } catch (e) {
    throw new Error("Cannot reach the server. Please try again.");
  }
  let data = {};
  try { data = await res.json(); } catch (e) { data = {}; }
  if (res.status === 401 && token && path.indexOf("/auth/login") === -1) {
    clearLogin();
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
