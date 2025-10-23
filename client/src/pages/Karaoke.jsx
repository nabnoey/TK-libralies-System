import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Karaoke() {
  const navigate = useNavigate();

  const rooms = [
    {
      id: 1,
      name: "ห้องคาราโอเกะ 1",
      desc: "ห้องขนาดกลาง บรรยากาศอบอุ่น พร้อมระบบเสียงคุณภาพสูง 🎶",
      image: "https://cdn-icons-png.flaticon.com/512/679/679720.png",
    },
    {
      id: 2,
      name: "ห้องคาราโอเกะ 2",
      desc: "ห้องขนาดใหญ่ รองรับได้สูงสุด 10 คน เหมาะสำหรับกลุ่มเพื่อน 🥳",
      image: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
    },
  ];

  return (
    <div className="bg-indigo-950 min-h-screen">
      <Navbar />

      {/* หัวข้อหน้า */}
      <div className="text-center text-white pt-20 mb-10">
        <h1 className="text-5xl font-bold mb-4">รอบจองห้องคาราโอเกะ 🎤</h1>
        <p className="text-gray-300">เลือกห้องที่ต้องการเพื่อทำการจอง</p>
      </div>

      {/* แสดง Card ห้องคาราโอเกะ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-10 pb-20">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <div className="bg-gradient-to-r from-pink-500 to-indigo-500 h-40 flex items-center justify-center">
              <img src={room.image} alt={room.name} className="w-24 h-24" />
            </div>

            <div className="p-6 text-blue-950">
              <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
              <p className="mb-4 text-gray-600">{room.desc}</p>

              <button
                onClick={() => navigate(`/reservation-karaoke/${room.id}`)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
              >
                จองห้อง
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Karaoke;
