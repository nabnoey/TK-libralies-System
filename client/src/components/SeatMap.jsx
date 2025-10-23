import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SeatMap = () => {
  const navigate = useNavigate();

  // โต๊ะทั้งหมด
  const tables = [
    { id: "T1", style: "top-[7%] left-[50%] -translate-x-1/2" },
    { id: "T2", style: "top-[15%] left-[25%]" },
    { id: "T3", style: "top-[15%] right-[25%]" },
    { id: "T4", style: "bottom-[15%] left-[25%]" },
    { id: "T5", style: "bottom-[15%] right-[25%]" },
    { id: "T6", style: "bottom-[7%] left-[50%] -translate-x-1/2" },
    { id: "T7", style: "top-[50%] left-[10%] -translate-y-1/2" },
    { id: "T8", style: "top-[50%] right-[10%] -translate-y-1/2" },
    { id: "T9", style: "top-[30%] left-[18%]" },
    { id: "T10", style: "top-[30%] right-[18%]" },
    { id: "T11", style: "bottom-[30%] left-[18%]" },
    { id: "T12", style: "bottom-[30%] right-[18%]" },
    { id: "T13", style: "top-[35%] left-[50%] -translate-x-1/2" },
    { id: "T14", style: "top-[50%] left-[35%] -translate-y-1/2" },
    { id: "T15", style: "top-[50%] right-[35%] -translate-y-1/2" },
    { id: "T16", style: "bottom-[35%] left-[50%] -translate-x-1/2" },
  ];

  // state
  const [booked, setBooked] = useState([]); // โต๊ะที่จองแล้ว
  const [selected, setSelected] = useState([]); // โต๊ะที่เลือกอยู่ตอนนี้

  // toggle เลือกโต๊ะ
  const toggleSelect = (id) => {
    if (booked.includes(id)) return; // ถ้าถูกจองแล้ว ห้ามเลือก
    setSelected((prev) => (prev[0] === id ? [] : [id])); // เลือกได้แค่โต๊ะเดียว
  };

  // ยืนยันการจอง
  const confirmBooking = () => {
  if (selected.length === 0) {
    Swal.fire("กรุณาเลือกโต๊ะก่อน", "", "warning");
    return;
  }

  const table = selected[0];

  Swal.fire({
    title: "ยืนยันการจองโต๊ะ?",
    text: `คุณต้องการจองโต๊ะ: ${table} หรือไม่`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#f472b6",
    cancelButtonColor: "#6b7280",
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/reservation-movies", {
        state: { seats: [table] },
      });
    }
  });
};

  return (
    <div className="flex flex-col items-center text-white">
      <h2 className="text-3xl font-bold mb-5 text-pink-400">
        ผังห้องมินิเธียร์เตอร์ 🎬
      </h2>

      {/* พื้นที่ผัง */}
      <div className="relative w-[700px] h-[700px] bg-indigo-900 rounded-3xl shadow-2xl clip-hex overflow-hidden">
        <div className="absolute inset-0 bg-indigo-800/60"></div>

        {/* โต๊ะทั้งหมด */}
        {tables.map((table) => (
          <div
            key={table.id}
            className={`absolute z-10 ${table.style} transition-all duration-300 flex flex-col items-center`}
          >
            <div className="w-10 h-2 bg-gray-200 rounded-md mb-1 shadow-inner"></div>

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
          <div className="w-5 h-5 rounded-full bg-green-300 border-2 border-green-200"></div>{" "}
          <span>ว่าง</span>
          <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-pink-300"></div>{" "}
          <span>เลือกแล้ว</span>
          <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-gray-400"></div>{" "}
          <span>ไม่ว่าง</span>
        </div>
      </div>

      <style>
        {`
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
