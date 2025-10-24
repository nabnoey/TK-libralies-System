import api from "./api";

const MOVIES_SEAT = import.meta.env.VITE_MOVIE_API

const createMoviesSeat = async (data) => api.post(`${MOVIES_SEAT}`, data);

const getAllMoviesSeat = async () =>{
    return await api.get(`${MOVIES_SEAT}`)
}

const getByIdMoviesSeat = async (id) => {
    return await api.get(`${MOVIES_SEAT}/${id}`)
}

const editMoviesSeat = async (id,data) => {
    return await api.put(`${MOVIES_SEAT}/${id}`,data)
}

const deleteMoviesSeat = async (id) => {
    return await api.delete(`${MOVIES_SEAT}/${id}`)
}
const KaraokeService = {
   createMoviesSeat,
   getAllMoviesSeat,
   getByIdMoviesSeat,
   editMoviesSeat,
   deleteMoviesSeat
}

export default KaraokeService