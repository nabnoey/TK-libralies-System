import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function DetailsReservation() {
  const location = useLocation();
  const navigate = useNavigate();

  // รับค่าจากการ navigate มาจากทั้งโรงหนังและคาราโอเกะ
  const { theater, seats, studentCodes } = location.state || {};

  // Redirect to rounds listing if opened without data
  useEffect(() => {
    if (!(theater && seats && studentCodes)) {
      navigate("/details-reservation", { replace: true });
    }
  }, [theater, seats, studentCodes, navigate]);

  // ตรวจว่าข้อมูลเป็นของอะไร
  const isKaraoke =
    theater && (theater.includes("คาราโอเกะ") || theater.includes("karaoke"));

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-8">
          {isKaraoke ? "รายละเอียดการจองห้องคาราโอเกะ 🎤" : "รายละเอียดการจองโรงภาพยนตร์ 🎬"}
        </h1>

        {theater && seats && studentCodes ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-blue-950">
            <p className="mb-3">
              <b>{isKaraoke ? "ห้องที่จอง:" : "โรงภาพยนตร์:"}</b> {theater}
            </p>

            {/* ถ้าเป็นคาราโอเกะจะไม่ใช้คำว่า “ที่นั่ง” แต่ถ้าเป็นโรงหนังให้แสดง */}
            {!isKaraoke && (
              <p className="mb-3">
                <b>ที่นั่งที่จอง:</b> {seats.join(", ")}
              </p>
            )}

            {isKaraoke && (
              <p className="mb-3">
                <b>ห้องที่จอง:</b> {seats.join(", ")}
              </p>
            )}

            <div className="mb-5">
              <b>รหัสนักศึกษาที่จอง:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                {studentCodes.map((code, i) => (
                  <li key={i}>{code}</li>
                ))}
              </ul>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/")}
                className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600 transition"
              >
                กลับหน้าแรก
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">
            ❌ ไม่พบข้อมูลการจอง กรุณากลับไปกรอกฟอร์มอีกครั้ง
          </p>
        )}
      </div>
    </div>
  );
}

export default DetailsReservation;
