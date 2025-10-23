import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovies } from "../services/movieService";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
  getMovies().then((data) => {
    console.log("API response:", data);
    const found = data.find((m) => String(m.id) === String(id));
    setMovie(found || null);
  });
}, [id]);



  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-950 text-white">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-950 min-h-screen text-white">
    

      <div className="hero bg-base-200 min-h-screen text-black">
        <div className="hero-content flex-col lg:flex-row border-2 rounded-xl shadow-2xl bg-white max-w-5xl">
          <img
            src={movie?.image || "https://via.placeholder.com/300x400?text=No+Image"}
            alt={movie?.title || "No title"}
            className="max-w-sm rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <div className="p-8">
            <h1 className="text-5xl font-bold text-blue-900">{movie.title}</h1>
            <h2 className="text-3xl mt-4 text-gray-700">เรื่องย่อ</h2>
            <p className="py-6 text-gray-800 leading-relaxed">{movie.description}</p>
            <button
              onClick={() => navigate(-1)}
              className="btn bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none hover:scale-105 transition-all duration-300"
            >
              กลับหน้าเดิม
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
