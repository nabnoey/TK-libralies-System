import React from "react";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { getMovies } from "../services/movieService";

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies().then((data) => setMovies(data));
  }, []);

  return (
    <div>
      <Navbar />

      <div className="carousel w-full">
        <div id="slide1" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp"
            className="w-full"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide4" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide2" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>
        <div id="slide2" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp"
            className="w-full"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide1" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide3" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>
        <div id="slide3" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp"
            className="w-full"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide2" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide4" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>
        <div id="slide4" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp"
            className="w-full"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide3" className="btn btn-circle">
              ❮
            </a>
            <a href="#slide1" className="btn btn-circle">
              ❯
            </a>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className=" bg-blue-950 w-50 h-15 justify-center mt-10 ml-175 rounded-lg">
        <div class="text-white text-center pt-2.5 text-[25px]">รอบจอง</div>
      </div>
=======
    <div className=" bg-blue-950 w-50 h-15 justify-center mt-10 ml-175 rounded-lg">
    <div class="text-white text-center pt-2.5 text-[25px]">รอบจอง65555</div>
</div>
>>>>>>> feature/movie-seats

      <div className="movies ml-30 ">
        <div className="pt-20 text-[30px] bold-5">ภาพยนต์แนะนำ</div>
      </div>

      <div className="pt-20 grid grid-cols-3 gap-10 mr-35 ml-55 mb-20">
        {movies.map((movie) => (
          <Card
            key={movie.id}
            id={movie.id}
            image={movie.image}
            title={movie.title}
            description={movie.description}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
