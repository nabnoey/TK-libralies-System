import api from "./api";

// ดึงค่าจาก .env
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || "https://tk-libralies-system.onrender.com";
const ADMIN_API = import.meta.env.VITE_ADMIN_API || "/admin";
const GOOGLE_API = import.meta.env.VITE_GOOGLE_API || "google";

const AuthService = {

  async getMe(token) {
    try {
      const res = await fetch(`${AUTH_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to fetch profile");
      return data;
    } catch (err) {
      console.error("getMe failed:", err);
      throw err;
    }
  },

  async loginWithGoogle() {
    try {
      // redirect ไปหน้า Google Auth ของ backend
      window.location.href = `${AUTH_BASE}/auth/${GOOGLE_API}`;
    } catch (err) {
      console.error("❌ Google login failed:", err);
      throw err;
    }
  },

  async registerAdmin(payload) {
    try {
      const res = await api.post(`${AUTH_BASE}/auth${ADMIN_API}/register`, payload);
      return res.data;
    } catch (err) {
      console.error("❌ Register admin failed:", err.response?.data || err.message);
      throw err.response?.data || new Error("Register failed");
    }
  },

 
  async loginAdmin(payload) {
    try {
      const res = await api.post(`${AUTH_BASE}/auth${ADMIN_API}/login`, payload);
     
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      return res.data;
    } catch (err) {
      console.error("❌ Admin login failed:", err.response?.data || err.message);
      throw err.response?.data || new Error("Login failed");
    }
  },

 
  logout() {
    localStorage.removeItem("token");
  },
};

export default AuthService;
