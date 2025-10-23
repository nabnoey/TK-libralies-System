import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ แก้ตรงนี้
import Swal from "sweetalert2";


const ReservationKaraoke = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ เพิ่มตรงนี้
  const { seats = [] } = location.state || {};

  const defaultTheater = "โรงภาพยนตร์ 1";

  const [studentCodes, setStudentCodes] = useState([]);
  const [inputCode, setInputCode] = useState("");

  // One movie reservation per day (client-side lock)
  const todayKey = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  })();

  React.useEffect(() => {
    try {
      const lockedGlobal = localStorage.getItem("bookingLockDate");
      const lockedMovie = localStorage.getItem("movieBookingLockDate");
      if (lockedGlobal === todayKey || lockedMovie === todayKey) {
        Swal.fire({
          title: "วันนี้คุณจองรอบหนังไปแล้ว",
          text: "จำกัด 1 รอบต่อวัน หากยกเลิกแล้วจะไม่สามารถจองซ้ำได้ในวันนี้",
          icon: "info",
          confirmButtonColor: "#f472b6",
        }).then(() => navigate("/details-reservation", { replace: true }));
      }
    } catch  { /* ignore lock read errors */ }
  }, []);

  // เมื่อกด Enter เพื่อเพิ่มรหัส
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputCode.trim();

      if (!trimmed) return;

      // ถ้ารหัสซ้ำ
      if (studentCodes.includes(trimmed)) {
        Swal.fire("รหัสนี้ถูกเพิ่มแล้ว!", "", "info");
        return;
      }

      setStudentCodes((prev) => [...prev, trimmed]);
      setInputCode("");
    }
  };

  // ลบรายการ
  const removeCode = (code) => {
    setStudentCodes((prev) => prev.filter((c) => c !== code));
  };

  // ยืนยันการจอง
  const handleSubmit = (e) => {
    e.preventDefault();

    // Block if already booked a movie today
    try {
      const locked = localStorage.getItem("movieBookingLockDate");
      if (locked === todayKey) {
        Swal.fire({
          title: "วันนี้คุณจองรอบหนังไปแล้ว",
          text: "จำกัด 1 รอบต่อวัน หากยกเลิกแล้วจะไม่สามารถจองซ้ำได้ในวันนี้",
          icon: "error",
          confirmButtonColor: "#f472b6",
        }).then(() => navigate("/details-reservation", { replace: true }));
        return;
      }
    } catch { /* ignore lock read errors */ }

    if (studentCodes.length === 0) {
      Swal.fire("กรุณากรอกรหัสนักศึกษาอย่างน้อย 1 รหัส", "", "warning");
      return;
    }

    Swal.fire({
      title: "การจองเสร็จสมบูรณ์! 🎉",
      icon: "success",
      confirmButtonColor: "#f472b6",
    }).then(() => {
      // Set daily lock for booking (global + movie for backward compatibility)
      try {
        localStorage.setItem("bookingLockDate", todayKey);
        localStorage.setItem("movieBookingLockDate", todayKey);
      } catch  { /* ignore persist errors */ }
      // Persist last reservation locally so Navbar flow can load it later
      try {
        const lastReservation = {
          theater: defaultTheater,
          seats: seats,
          studentCodes: studentCodes,
          type: "movie",
          savedAt: Date.now(),
        };
        localStorage.setItem("lastReservation", JSON.stringify(lastReservation));
      } catch  { /* ignore persist errors */ }
      // ส่งข้อมูลไปหน้า DetailsReservation
      navigate("/details-reservation", {
        state: {
          theater: defaultTheater,
          seats: seats,
          studentCodes: studentCodes,
        },
      });
    });
  };

  return (
 
      <div className="max-w-3xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-8">
          ฟอร์มการจองที่นั่ง
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-md text-blue-950">
          <p className="mb-3">
            <b>โรงภาพยนตร์:</b> {defaultTheater}
          </p>
          <p className="mb-3">
            <b>ที่นั่งที่เลือก:</b> {seats.join(", ")}
          </p>
          <p className="mb-5">
            <b>รหัสนักศึกษา:</b> พิมพ์แล้วกด Enter เพื่อเพิ่ม
          </p>

          <form onSubmit={handleSubmit}>
            {/* ช่องกรอกรหัส */}
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-pink-400 outline-none"
              placeholder="กรอกรหัสนักศึกษาแล้วกด Enter"
            />

            {/* รายการรหัสนักศึกษา */}
            {studentCodes.length > 0 ? (
              <ul className="mb-5 divide-y divide-gray-200">
                {studentCodes.map((code, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center py-2 px-3 hover:bg-pink-50 rounded-lg"
                  >
                    <span className="font-medium">{code}</span>
                    <button
                      type="button"
                      onClick={() => removeCode(code)}
                      className="text-red-500 hover:text-red-700"
                      title="ลบ"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mb-5">
                ยังไม่มีรหัสนักศึกษาในรายการ
              </p>
            )}

            <div className="text-center mt-6">
              <button
                type="submit"
                className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600 transition"
              >
                ยืนยันการจอง ({studentCodes.length})
              </button>
            </div>
          </form>
        </div>
      </div>
   
  );
};

export default ReservationKaraoke;
