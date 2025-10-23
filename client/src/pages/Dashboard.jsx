import React from "react";
import { Link } from "react-router-dom"; 

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-100 to-purple-100">

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 drop-shadow-md">
            Dashboard (Admin)
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            จัดการข้อมูล เพิ่มรอบโรงภาพยนตร์และห้องคาราโอเกะได้ที่นี่
          </p>
          <div className="mt-5 w-32 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500 mx-auto rounded-full shadow-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* การ์ดโรงภาพยนตร์ */}
          <div className="card bg-base-100 shadow-xl border border-indigo-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl">
            <figure className="px-10 pt-10">
              <img
                src="https://www.thaihealth.or.th/data/content/2020/05/52450/cms/newscms_thaihealth_c_hmnsuvw12457.jpg"
                alt="โรงภาพยนตร์"
                className="w-fit h-50 object-cover rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold text-indigo-600">
                🎬 โรงภาพยนตร์
              </h2>
              <p className="text-gray-500 mt-2 mb-4">
                เพิ่มรอบการจองและจัดการข้อมูลโรงภาพยนตร์ทั้งหมด
              </p>
              <div className="card-actions justify-center">
                {/* ✅ ใช้ Link แทน a */}
                <Link
                  to="/reservation-movies"
                  className="btn bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:scale-105 transition-all duration-300"
                >
                  เพิ่มรอบจอง
                </Link>
              </div>
            </div>
          </div>

          {/* การ์ดคาราโอเกะ */}
          <div className="card bg-base-100 shadow-xl border border-pink-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl">
            <figure className="px-10 pt-10">
              <img
                src="https://img.wongnai.com/p/624x0/2019/06/03/d7fb356d07f84684b3661fd6538d8ed3.jpg"
                alt="ห้องคาราโอเกะ"
                className="w-fit h-50 object-cover rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold text-pink-600">
                🎤 ห้องคาราโอเกะ
              </h2>
              <p className="text-gray-500 mt-2 mb-4">
                เพิ่มรอบจองห้องคาราโอเกะและดูรายการทั้งหมดในระบบ
              </p>
              <div className="card-actions justify-center">
                <Link
                  to="/reservation-karaoke"
                  className="btn bg-gradient-to-r from-pink-500 to-rose-400 text-white border-none hover:scale-105 transition-all duration-300"
                >
                  เพิ่มรอบจอง
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
