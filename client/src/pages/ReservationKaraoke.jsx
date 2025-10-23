import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function ReservationKaraoke() {
  const { roomId } = useParams(); // ✅ อ่าน roomId จาก URL
  const navigate = useNavigate();
  const id = parseInt(roomId);


  const roomName =
    id === 1
      ? "ห้องคาราโอเกะ 1"
      : id === 2
      ? "ห้องคาราโอเกะ 2"
      : "ไม่ระบุห้อง";

  const [studentCodes, setStudentCodes] = useState([]);
  const [inputCode, setInputCode] = useState("");

  // เมื่อกด Enter เพื่อเพิ่มรหัสนักศึกษา
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputCode.trim();

      if (!trimmed) return;

      if (studentCodes.includes(trimmed)) {
        Swal.fire("รหัสนี้ถูกเพิ่มแล้ว!", "", "info");
        return;
      }

      setStudentCodes((prev) => [...prev, trimmed]);
      setInputCode("");
    }
  };

  // ลบรหัสที่เพิ่ม
  const removeCode = (code) => {
    setStudentCodes((prev) => prev.filter((c) => c !== code));
  };

  // ยืนยันการจอง
 const handleSubmit = (e) => {
  e.preventDefault();

  // ✅ ต้องมีอย่างน้อย 4 รหัสนักศึกษา
  if (studentCodes.length < 4) {
    Swal.fire("กรุณากรอกรหัสนักศึกษาอย่างน้อย 4 รหัส", "", "warning");
    return;
  }

  Swal.fire({
    title: "จองห้องสำเร็จแล้ว! 🎉",
    icon: "success",
    confirmButtonColor: "#f472b6",
  }).then(() => {
    navigate("/details-reservation", {
      state: {
        theater: `ห้องคาราโอเกะ ${roomId}`,
        seats: [`ห้องคาราโอเกะ ${roomId}`],
        studentCodes: studentCodes,
      },
    });
  });
};


  return (
    <div className="min-h-screen bg-pink-50">


      <div className="max-w-3xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-8">
          ฟอร์มการจองห้องคาราโอเกะ 🎤
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-md text-blue-950">
          <p className="mb-3">
            <b>ห้องที่เลือก:</b> {roomName}
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

            {/* รายการรหัสที่เพิ่ม */}
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
    </div>
  );
}


export default ReservationKaraoke;
