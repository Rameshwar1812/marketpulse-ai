const TOKEN_KEY = "marketpulse_jwt_token";
const USER_KEY = "marketpulse_user_info";

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  clearAll() {
    this.clearToken();
    this.clearUser();
  }
};
