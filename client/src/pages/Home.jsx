import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { getMovies } from "../services/movieService";

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies().then((data) => setMovies(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-pink-900 text-white font-sans">
      {/* 🔹 Navbar */}
      <Navbar />

      {/* 🔹 Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden mt-16">
        <img
          src="https://images.unsplash.com/photo-1608889175123-8a9b6e97c02e?q=80&w=2070"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-pink-300 drop-shadow-lg mb-4 animate-fadeIn">
            🎬 ยินดีต้อนรับสู่ NPRU Booking
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed mb-6">
            จองภาพยนตร์และห้องคาราโอเกะได้ง่าย ๆ สะดวก รวดเร็ว พร้อมดีลสุดพิเศษสำหรับนักศึกษา!
          </p>
         
        </div>
      </div>

      

      {/* 🔹 ภาพยนตร์แนะนำ Section */}
      <section className="mt-20 px-8">
        <h2 className="text-4xl font-extrabold text-center text-pink-300 mb-3 pt-15">
          ภาพยนตร์แนะนำประจำสัปดาห์ 🍿
        </h2>
        <p className="text-center text-gray-300 mb-12">
          รวมภาพยนตร์ยอดนิยม ที่ได้รับกระแสตอบรับจากผู้ชมทั่วประเทศ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-center items-center">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-all duration-300"
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover opacity-90 hover:opacity-100 transition"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 p-5">
                <h3 className="text-xl font-bold text-white mb-1">
                  {movie.title}
                </h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {movie.description}
                </p>
                <a
                  href={`/details/${movie.id}`}
                  className="inline-block bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
                >
                  ดูรายละเอียด
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

     
      {/* 🔹 Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default Home;
