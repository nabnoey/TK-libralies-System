import axios from "axios";
// Use the same API base used elsewhere in the app
const baseURL = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
