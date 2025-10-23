import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-indigo-950 text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        {/* คอลัมน์ 1: โลโก้ / ชื่อ */}
        <div>
          <h2 className="text-2xl font-bold text-pink-400 mb-3">🎬 NPRU Booking</h2>
          <p className="text-gray-300 text-sm">
            ระบบจองโรงภาพยนตร์และห้องคาราโอเกะออนไลน์ของมหาวิทยาลัยราชภัฏนครปฐม
            เพื่อความสะดวกและรวดเร็วในการใช้บริการ 💖
          </p>
        </div>

        {/* คอลัมน์ 2: ลิงก์ด่วน */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-pink-300">เมนูด่วน</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-pink-400 transition">หน้าแรก</Link></li>
            <li><Link to="/movies" className="hover:text-pink-400 transition">โรงภาพยนตร์</Link></li>
            <li><Link to="/karaoke" className="hover:text-pink-400 transition">คาราโอเกะ</Link></li>
            <li><Link to="/details-reservation" className="hover:text-pink-400 transition">ดูรอบการจอง</Link></li>
          </ul>
        </div>

        {/* คอลัมน์ 3: ข้อมูลติดต่อ */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-pink-300">ติดต่อเรา</h3>
          <p className="text-gray-300 text-sm">
            มหาวิทยาลัยราชภัฏนครปฐม  
            <br /> 85 ถนนมาลัยแมน ต.หนองปากโลง อ.เมือง  
            <br /> จ.นครปฐม 73000
          </p>
          <p className="mt-3 text-gray-300 text-sm">
            โทรศัพท์: 0-3426-1000  
            <br /> อีเมล: info@npru.ac.th
          </p>
        </div>
      </div>

      {/* เส้นคั่น & ลิขสิทธิ์ */}
      <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} NPRU Booking — Developed with 💗 by Team Project
      </div>
    </footer>
  );
}

export default Footer;
