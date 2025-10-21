import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMovies } from "../services/movieService";

function Details() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
 console.log(movie)
  useEffect(() => {
    getMovies().then((data) => {
      const found = data.find((m) => m.id === parseInt(id));
      setMovie(found);
    });
  }, [id]);

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-950 min-h-screen text-white">
      <Navbar />

      <div className="hero bg-base-200 min-h-screen text-black">
        <div className="hero-content flex-col lg:flex-row border-2 rounded-xl shadow-xl bg-white">
          <img
            src={movie.image}
            alt={movie.title}
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div className="p-6">
            <h1 className="text-5xl font-bold text-blue-900">{movie.title}</h1>
            <h2 className="text-[35px] mt-4 text-gray-700">เรื่องย่อ</h2>
            <p className="py-6 text-gray-800">{movie.description}</p>
            <button className="btn btn-primary">กลับหน้าแรก</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
