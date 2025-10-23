import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function DetailsReservation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { theater, seats, studentCodes } = location.state || {};

  useEffect(() => {
    if (location.state && theater && seats && studentCodes) {
      try {
        localStorage.setItem(
          "lastReservation",
          JSON.stringify({ theater, seats, studentCodes, savedAt: Date.now() })
        );
      } catch {}
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("lastReservation"));
      if (stored && stored.theater && stored.seats && stored.studentCodes) {
        navigate("/details-reservation", { state: stored, replace: true });
        return;
      }
    } catch {}
  }, [location.state, theater, seats, studentCodes, navigate]);

  const isKaraoke =
    theater && (theater.includes("คาราโอเกะ") || theater.includes("karaoke"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-pink-900 text-white pt-25">
      <div className="max-w-3xl mx-auto py-20 px-6 animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-lg">
          {isKaraoke
            ? "🎤 รายละเอียดการจองห้องคาราโอเกะ"
            : "🎬 รายละเอียดการจองโรงภาพยนตร์"}
        </h1>

        {theater && seats && studentCodes ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-8 text-white">
            <p className="mb-3 text-lg">
              <b className="text-pink-300">
                {isKaraoke ? "ห้องที่จอง:" : "โรงภาพยนตร์:"}
              </b>{" "}
              {theater}
            </p>

            {!isKaraoke && (
              <p className="mb-3 text-lg">
                <b className="text-pink-300">ที่นั่งที่จอง:</b>{" "}
                {seats.join(", ")}
              </p>
            )}

            {isKaraoke && (
              <p className="mb-3 text-lg">
                <b className="text-pink-300">ห้องที่จอง:</b>{" "}
                {seats.join(", ")}
              </p>
            )}

            <div className="mb-6">
              <b className="text-pink-300 text-lg">รหัสนักศึกษาที่จอง:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-200">
                {studentCodes.map((code, i) => (
                  <li key={i}>{code}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 justify-center mt-8">
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
                  try {
                    localStorage.removeItem("lastReservation");
                  } catch {}
                  await Swal.fire({
                    title: "ยกเลิกสำเร็จ",
                    icon: "success",
                    confirmButtonColor: "#f472b6",
                  });
                  navigate("/details-reservation", { replace: true });
                }}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-2 rounded-full font-semibold shadow-lg transition duration-300"
              >
                ยกเลิกการจอง
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-indigo-700 text-white px-8 py-2 rounded-full font-semibold shadow-lg transition duration-300"
              >
                กลับหน้าแรก
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-white bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-xl">
            <p className="text-gray-300 mb-8 text-lg">
              ❌ คุณยังไม่ได้จองในขณะนี้
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/movies")}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-indigo-700 text-white px-8 py-2 rounded-full font-semibold shadow-lg transition duration-300"
              >
                ไปจองรอบโรงหนัง
              </button>
              <button
                onClick={() => navigate("/karaoke")}
                className="bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white px-8 py-2 rounded-full font-semibold shadow-lg transition duration-300"
              >
                ไปจองห้องคาราโอเกะ
              </button>
            </div>
          </div>
        )}
      </div>


      {/* animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default DetailsReservation;
