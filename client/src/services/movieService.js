import api from "./api";

const API_URL = "http://localhost:5001/movies";

export async function getMovies() {
  const res = await api.get(API_URL);
  return res.data;
}

