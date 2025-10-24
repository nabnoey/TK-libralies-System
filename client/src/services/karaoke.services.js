import api from "./api";

const KARAOKE_API = import.meta.env.VITE_KARAOKE_API

const createKaraoke = async (data) => api.post(`${KARAOKE_API}`, data);

const getAllKaraoke = async () =>{
    return await api.get(`${KARAOKE_API}`)
}

const getByIdKaraoke = async (id) => {
    return await api.get(`${KARAOKE_API}/${id}`)
}

const editKaraoke = async (id,data) => {
    return await api.put(`${KARAOKE_API}/${id}`,data)
}

const deleteKaraoke = async (id) => {
    return await api.delete(`${KARAOKE_API}/${id}`)
}
const KaraokeService = {
    createKaraoke,
    getAllKaraoke,
    getByIdKaraoke,
    editKaraoke,
    deleteKaraoke
}

export default KaraokeService