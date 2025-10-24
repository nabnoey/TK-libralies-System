import api from "./api";

const RESERVATION_API = import.meta.env.VITE_RESERVATION_API; 


export const getMovieSeatsStatus = async (date) => {
  const res = await api.get(`${RESERVATION_API}/movie-seats`, {
    params: { date },
  });
  return res.data; 
};

const ReservationsService = {
  getMovieSeatsStatus,
};

export default ReservationsService;

