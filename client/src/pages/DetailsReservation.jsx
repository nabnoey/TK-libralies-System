import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function DetailsReservation() {
  const location = useLocation();
  const navigate = useNavigate();

  // รับค่าจากการ navigate มาจากทั้งโรงหนังและคาราโอเกะ
  const { theater, seats, studentCodes } = location.state || {};

  // Persist state if present; otherwise try to load from localStorage
  useEffect(() => {
    if (location.state && theater && seats && studentCodes) {
      try {
        localStorage.setItem(
          "lastReservation",
          JSON.stringify({ theater, seats, studentCodes, savedAt: Date.now() })
        );
      } catch { /* ignore persist errors */ }
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("lastReservation"));
      if (stored && stored.theater && stored.seats && stored.studentCodes) {
        navigate("/details-reservation", { state: stored, replace: true });
        return;
      }
    } catch { /* ignore load errors */ }
    // no stored data -> keep user on this page and show empty state
  }, [location.state, theater, seats, studentCodes, navigate]);

  // ตรวจว่าข้อมูลเป็นของอะไร
  const isKaraoke =
    theater && (theater.includes("คาราโอเกะ") || theater.includes("karaoke"));

  return (
    <div className="min-h-screen bg-pink-50">
      
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

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={async () => {
                  const res = await Swal.fire({
                    title: "ยืนยันยกเลิกการจอง",
                    text: "คุณต้องการยกเลิกการจองของคุณหรือไม่?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ef4444",
                    cancelButtonColor: "#6b7280",
                    confirmButtonText: "ยืนยัน",
                    cancelButtonText: "ยกเลิก",
                  });
                  if (!res.isConfirmed) return;
                  try { localStorage.removeItem("lastReservation"); } catch { /* ignore */ }
                  await Swal.fire({
                    title: "ยกเลิกสำเร็จ",
                    icon: "success",
                    confirmButtonColor: "#f472b6",
                  });
                  navigate("/details-reservation", { replace: true });
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
              >
                ยกเลิกการจอง
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600 transition"
              >
                กลับหน้าแรก
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-blue-950">
            <p className="text-gray-600 mb-6">❌ คุณยังไม่ได้จองในขณะนี้</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/movies")}
                className="btn bg-pink-500 text-white rounded-xl hover:bg-pink-600"
              >
                ไปจองรอบโรงหนัง
              </button>
              <button
                onClick={() => navigate("/karaoke")}
                className="btn bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
              >
                ไปจองห้องคาราโอเกะ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailsReservation;
