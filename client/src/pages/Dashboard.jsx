import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        {/* หัวข้อหลัก */}
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard (Admin)</h1>
        <p className="text-center text-gray-500 mb-10">
          จัดการข้อมูลเพิ่มรอบโรงภาพยนตร์และห้องคาราโอเกะได้ที่นี่
        </p>

        {/* ส่วนของการ์ด 2 หมวด */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* การ์ดเพิ่มหนัง */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl mb-2">🎬 โรงภาพยนตร์</h2>
              {/* <p className="text-sm text-gray-500">
                เพิ่ม แก้ไข หรือลบข้อมูลภาพยนตร์ในระบบ
              </p> */}
              <div className="card-actions justify-end mt-5">
                <Link to="/add-movieSeat" className="btn btn-primary">
                  เพิ่มรอบจอง
                </Link>
              </div>
            </div>
          </div>

          {/* การ์ดเพิ่มคาราโอเกะ */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl mb-2">🎤 ห้องคาราโอเกะ</h2>
              {/* <p className="text-sm text-gray-500">
                เพิ่มเพลงหรือห้องคาราโอเกะใหม่ในระบบ
              </p> */}
              <div className="card-actions justify-end mt-5">
                <Link to="/add-karaokeRoom" className="btn btn-secondary">
                  เพิ่มรอบจอง
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนอื่นในอนาคต เช่น สถิติ
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">📊 สถิติการใช้งาน</h2>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">จำนวนภาพยนตร์</div>
              <div className="stat-value text-primary">128</div>
              <div className="stat-desc">อัปเดตล่าสุดเมื่อ 2 ชม.ที่แล้ว</div>
            </div>

            <div className="stat">
              <div className="stat-title">จำนวนห้องคาราโอเกะ</div>
              <div className="stat-value text-secondary">42</div>
              <div className="stat-desc">อัปเดตล่าสุดเมื่อ 3 ชม.ที่แล้ว</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Dashboard;
