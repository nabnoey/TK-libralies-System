import React, { useState } from "react";
import Swal from "sweetalert2";
import MoviesSeat from "../services/movies.services";
import { useNavigate } from "react-router-dom";

export default function AddMovieSeat() {
  const [seatImage, setSeatImage] = useState(null);
  const [seatName, setSeatName] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSeatImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSeat = async () => {
    if (!seatName.trim()) {
      Swal.fire("กรุณากรอกชื่อหรือรหัสที่นั่ง!", "", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "คุณต้องการเพิ่มที่นั่งสำหรับดูหนังหรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      icon: "question",
      customClass: {
        popup: "bg-white text-gray-800",
        title: "text-gray-900",
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-ghost",
      },
    });

    if (!result.isConfirmed) return;

    try {
      // ✅ ส่งเฉพาะ name และ image
      await MoviesSeat.createMoviesSeat({
        name: seatName,
        image: seatImage,
      });

      await Swal.fire({
        title: "เพิ่มที่นั่งสำเร็จแล้ว!",
        icon: "success",
        customClass: {
          popup: "bg-white text-gray-800",
          title: "text-gray-900",
        },
      });

      // ✅ รีเซ็ตค่า และกลับหน้า /movies
      setSeatName("");
      setSeatImage(null);
      navigate("/movies");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text:
          error?.response?.data?.message ||
          "เพิ่มที่นั่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-30">
      <div className="max-w-2xl mx-auto my-12 p-8 card bg-base-100 shadow-xl border border-gray-300 rounded-box">
        <h2 className="text-center text-3xl font-extrabold mb-10 text-primary">
          เพิ่มที่นั่งดูหนัง ✨
        </h2>

        <div className="space-y-7">
          {/* 🔹 ชื่อที่นั่ง */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-white">
                ชื่อ / รหัสที่นั่ง <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-gray-500"
              placeholder="เช่น A1, VIP-02"
              value={seatName}
              onChange={(e) => setSeatName(e.target.value)}
            />
          </div>

          {/* 🔹 อัปโหลดรูปภาพ */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                รูปภาพที่นั่ง <span className="text-error">*</span>
              </span>
            </label>
            <div className="flex justify-center items-center h-52 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-50 relative group">
              <input
                type="file"
                accept="image/*"
                className="opacity-0 absolute w-full h-full cursor-pointer z-10"
                onChange={handleImageChange}
              />
              {!seatImage ? (
                <div className="text-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-white mb-3 group-hover:text-primary transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"
                    />
                  </svg>
                  <span className="text-white text-sm group-hover:text-gray-700 transition-colors">
                    ลากและวางไฟล์รูปภาพ หรือ คลิกเพื่อเลือก
                  </span>
                  <p className="text-xs text-white mt-1">
                    ไฟล์ที่รองรับ: JPG, PNG, GIF
                  </p>
                </div>
              ) : (
                <img
                  src={seatImage}
                  alt="Seat Preview"
                  className="h-full w-full object-contain p-2 rounded-lg z-0"
                />
              )}
            </div>
          </div>
        </div>

        {/* 🔹 ปุ่มบันทึก */}
        <div className="mt-10">
          <button
            className="btn btn-primary w-full text-lg font-bold"
            onClick={handleAddSeat}
            disabled={!seatImage || !seatName}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            เพิ่มที่นั่ง
          </button>
        </div>
      </div>
    </div>
  );
}
