import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SeatMap = () => {
  const navigate = useNavigate();

  // ปรับการจัดวางให้กระจายตัวตามขอบ/มุม เพื่อเห็นเลขโต๊ะชัดเจน
  const tables = [
    // 🔹 กลุ่มมุม (6 ตัว) - กระจายตามมุมของห้องหกเหลี่ยม
    // T1: Top Center (ยังคงไว้เป็นจุดอ้างอิง)
    { id: "T1", style: "top-[7%] left-[50%] -translate-x-1/2" },       
    
    // T2 & T3: Top-Sides (ใกล้ขอบด้านบน-ซ้าย/ขวา)
    { id: "T2", style: "top-[15%] left-[25%]" },                       // Top-left side
    { id: "T3", style: "top-[15%] right-[25%]" },                      // Top-right side
    
    // T4 & T5: Bottom-Sides (ใกล้ขอบด้านล่าง-ซ้าย/ขวา)
    { id: "T4", style: "bottom-[15%] left-[25%]" },                    // Bottom-left side
    { id: "T5", style: "bottom-[15%] right-[25%]" },                   // Bottom-right side
    
    // T6: Bottom Center (ยังคงไว้)
    { id: "T6", style: "bottom-[7%] left-[50%] -translate-x-1/2" },    

    // 🔹 กลุ่มขอบด้านข้าง (4 ตัว) - เน้นการจัดวางตามขอบด้านซ้ายและขวา
    { id: "T7", style: "top-[50%] left-[10%] -translate-y-1/2" },      // Far-Left Edge
    { id: "T8", style: "top-[50%] right-[10%] -translate-y-1/2" },     // Far-Right Edge

    // T9 & T10: Top-Mid Sides
    { id: "T9", style: "top-[30%] left-[18%]" },                       // Mid-Top-left
    { id: "T10", style: "top-[30%] right-[18%]" },                     // Mid-Top-right
    
    // 🔹 กลุ่มรอบศูนย์กลาง (6 ตัว) - จัดเป็นวงแหวนชั้นในหลวมๆ
    { id: "T11", style: "bottom-[30%] left-[18%]" },                   // Mid-Bottom-left
    { id: "T12", style: "bottom-[30%] right-[18%]" },                  // Mid-Bottom-right
    
    // T13 & T14 & T15 & T16: โต๊ะรอบวงใน (ลดจำนวนโต๊ะลงเพื่อให้ผังโล่งขึ้น)
    { id: "T13", style: "top-[35%] left-[50%] -translate-x-1/2" },     // Inner Top
    { id: "T14", style: "top-[50%] left-[35%] -translate-y-1/2" },     // Inner Left
    { id: "T15", style: "top-[50%] right-[35%] -translate-y-1/2" },    // Inner Right
    { id: "T16", style: "bottom-[35%] left-[50%] -translate-x-1/2" },  // Inner Bottom
  ];


  // T5 ถูกจองไว้
  const [booked] = useState(["T5"]); 
  const [selected, setSelected] = useState([]);

 const toggleSelect = (id) => {
  if (booked.includes(id)) return;
  setSelected((prev) => (prev[0] === id ? [] : [id]));
};

  const confirmBooking = () => {
    if (selected.length === 0) {
      Swal.fire("กรุณาเลือกโต๊ะก่อน", "", "warning");
      return;
    }

    Swal.fire({
      title: "ยืนยันการเลือกโต๊ะ? 🧐",
      text: `คุณเลือกโต๊ะ: ${selected.join(", ")}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ไปหน้าจอง",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#f472b6",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/reservation-movies", { state: { seats: selected } });
      }
    });
  };

  return (
    <div className="flex flex-col items-center text-white">
      <h2 className="text-3xl font-bold mb-5 text-pink-400">
        ผังห้องมินิเธียร์เตอร์ 🎬
      </h2>
      <div className="relative w-[700px] h-[700px] bg-indigo-900 rounded-3xl shadow-2xl clip-hex overflow-hidden">
        {/* พื้นหลังหกเหลี่ยมโปร่ง */}
        <div className="absolute inset-0 bg-indigo-800/60"></div>


        {/* โต๊ะแต่ละตัว */}
        {tables.map((table) => (
          <div
            key={table.id}
            className={`absolute z-10 ${table.style} transition-all duration-300 flex flex-col items-center`} 
          >
            {/* จอเล็ก */}
            <div className="w-10 h-2 bg-gray-200 rounded-md mb-1 shadow-inner"></div>

            {/* โต๊ะ */}
            <button
              onClick={() => toggleSelect(table.id)}
              disabled={booked.includes(table.id)}
              className={`w-20 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm
                ${
                  booked.includes(table.id)
                    ? "bg-gray-500 cursor-not-allowed border-gray-400 text-gray-200"
                    : selected.includes(table.id)
                    ? "bg-pink-400 border-pink-300 shadow-lg scale-105"
                    : "bg-green-300 hover:bg-green-400 border-green-200 text-gray-800"
                }`}
            >
              {table.id}
            </button>
          </div>
        ))}
      </div>
      
      {/* ส่วนควบคุม */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={confirmBooking}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg shadow-md font-bold transition duration-200"
        >
          ยืนยันการเลือกโต๊ะ ({selected.length})
        </button>
        <div className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
             <div className="w-5 h-5 rounded-full bg-green-300 border-2 border-green-200"></div> <span>ว่าง</span>
             <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-pink-300"></div> <span>เลือกแล้ว</span>
             <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-gray-400"></div> <span>ไม่ว่าง</span>
        </div>
      </div>

      <style>
        {`
          /* หกเหลี่ยมสมมาตรแนวตั้ง */
          .clip-hex {
            clip-path: polygon(
              50% 0%, 
              100% 25%, 
              100% 75%, 
              50% 100%, 
              0% 75%, 
              0% 25%
            );
          }
        `}
      </style>

    </div>
  );
};

export default SeatMap;