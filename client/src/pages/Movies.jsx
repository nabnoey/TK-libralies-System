import React from "react";
import Navbar from "../components/Navbar";
import CardMovie from "../components/CardMovie";
import SeatMap from "../components/SeatMap";

function Movies() {
  return (
    <div className="bg-indigo-950 min-h-screen">
      <Navbar />

      <div className="ml-5 mt-20 mb-10 text-white text-[30px]">
        <div className="text-center text-[50px] font-bold">
          รอบจองโรงหนัง
        </div>
      </div>

      {/* ผังที่นั่ง */}
      <div className="flex justify-center mb-20">
        <SeatMap />
      </div>

      {/* การ์ดหนัง */}
      <div className="pt-10 grid grid-cols-3 gap-10 mx-40 mb-20">
        <CardMovie />
        <CardMovie />
        <CardMovie />
      </div>
    </div>
  );
}

export default Movies;
