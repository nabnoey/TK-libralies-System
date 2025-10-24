import React from "react";

import SeatMap from "../components/SeatMap";

function Movies() {
  return (
    <div className="bg-indigo-950 min-h-screen">


      <div className="ml-5 mt-20 mb-10 text-white text-[30px] pt-25">
        <div className="text-center text-[50px] font-bold">
          รอบจองโรงหนัง
        </div>
      </div>
      

      {/* ผังที่นั่ง */}
      <div className="flex justify-center mb-20">
        <SeatMap />
      </div>

    
    </div>
  );
}

export default Movies;
