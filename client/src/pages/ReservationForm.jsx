import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

const ReservationForm = () => {
  const location = useLocation();
  const { seats = [] } = location.state || {};

  const defaultTheater = "โรงภาพยนตร์ 1";
  const defaultCount = 6;

  const [studentCodes, setStudentCodes] = useState(
    Array(defaultCount).fill("")
  );

  const handleChange = (index, value) => {
    const updated = [...studentCodes];
    updated[index] = value;
    setStudentCodes(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allFilled = studentCodes.every((code) => code.trim() !== "");
    if (!allFilled) {
      Swal.fire("กรุณากรอกรหัสนักศึกษาให้ครบ", "", "warning");
      return;
    }

    Swal.fire(
      "การจองเสร็จสมบูรณ์!",
      `ที่นั่ง: ${seats.join(", ")}\nโรง: ${defaultTheater}`,
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-8">
          ฟอร์มการจองที่นั่ง
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <p className="mb-3">
            <b>โรงหนัง:</b> {defaultTheater}
          </p>
          <p className="mb-3">
            <b>ที่นั่งที่เลือก:</b> {seats.join(", ")}
          </p>
          <p className="mb-5">
            <b>จำนวนที่นั่ง:</b> {defaultCount} ที่นั่ง
          </p>

          <form onSubmit={handleSubmit}>
            {studentCodes.map((code, i) => (
              <div key={i} className="mb-4">
                <label className="block font-medium mb-1">
                  รหัสนักศึกษาคนที่ {i + 1}:
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="กรอกรหัสนักศึกษา"
                  required
                />
              </div>
            ))}

            <div className="text-center mt-6">
              <button
                type="submit"
                className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600"
              >
                ยืนยันการจอง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
