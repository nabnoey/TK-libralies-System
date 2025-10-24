import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import MovieSeatService from "../services/movies.services"; // ✅ import service ที่ใช้จัดการ API

export default function EditMovieSeat() {
  const { seatId } = useParams();

  const [seatIdentifier, setSeatIdentifier] = useState("");
  const [seatImage, setSeatImage] = useState(null);
  const [seatStatus, setSeatStatus] = useState("available");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ โหลดข้อมูลที่นั่งจาก API เมื่อเปิดหน้า
  useEffect(() => {
    const fetchSeat = async () => {
      try {
        const res = await MovieSeatService.getByIdMoviesSeat(seatId);
        const data = res.data;

        setSeatIdentifier(data.identifier);
        setSeatStatus(data.status);
        setSeatImage(data.imageUrl);
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถโหลดข้อมูลที่นั่งได้",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeat();
  }, [seatId]);

  // ✅ เมื่อเลือกภาพใหม่
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSeatImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ เมื่อกดปุ่มอัปเดต
  const handleUpdateSeat = async () => {
    const result = await Swal.fire({
      title: "คุณต้องการอัปเดตข้อมูลที่นั่งนี้หรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการแก้ไข",
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
     
      await MovieSeatService.editMoviesSeat(seatId, {
        identifier: seatIdentifier,
        imageUrl: seatImage,
        status: seatStatus,
      });

      await Swal.fire({
        title: "แก้ไขข้อมูลที่นั่งสำเร็จแล้ว 🎉",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/movies");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: error?.response?.data?.message || "ไม่สามารถอัปเดตที่นั่งได้",
        icon: "error",
      });
    }
  };

  // ✅ แสดงโหลดระหว่างรอข้อมูล
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-3 text-lg">กำลังโหลดข้อมูลที่นั่ง...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto my-12 p-8 card bg-base-100 shadow-xl border border-gray-300 rounded-box">
        <h2 className="text-center text-3xl font-extrabold mb-10 text-primary">
          แก้ไขที่นั่งดูหนัง: {seatIdentifier} ✏️
        </h2>

        <div className="space-y-7">
          {/* 🪑 รหัสที่นั่ง */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                รหัส/ชื่อที่นั่ง <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-gray-800"
              value={seatIdentifier}
              onChange={(e) => setSeatIdentifier(e.target.value)}
              placeholder="เช่น A1, VIP-C2"
              required
            />
          </div>

          {/* 🖼️ รูปภาพที่นั่ง */}
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
                    className="h-10 w-10 mx-auto text-gray-500 mb-3 group-hover:text-primary transition-colors"
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
                  <span className="text-gray-500 text-sm group-hover:text-gray-700 transition-colors">
                    ลากและวางไฟล์รูปภาพ หรือ คลิกเพื่อเลือก
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    ไฟล์ที่รองรับ: JPG, PNG, GIF
                  </p>
                </div>
              ) : (
                <img
                  src={seatImage}
                  alt="ตัวอย่างรูปภาพที่นั่ง"
                  className="h-full w-full object-contain p-2 rounded-lg z-0"
                />
              )}
            </div>
          </div>

          {/* 📋 สถานะ */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                สถานะที่นั่ง
              </span>
            </label>
            <select
              className="select select-bordered w-full text-gray-800"
              value={seatStatus}
              onChange={(e) => setSeatStatus(e.target.value)}
            >
              <option value="available">ว่าง (Available)</option>
              <option value="occupied">ไม่ว่าง/ถูกจอง (Occupied)</option>
            </select>
          </div>
        </div>

        {/* 🔘 ปุ่มอัปเดต */}
        <div className="mt-10">
          <button
            className="btn btn-primary w-full text-lg font-bold"
            onClick={handleUpdateSeat}
            disabled={!seatImage || !seatIdentifier}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m3.987 2H20M9 13l-3-3m0 0l-3 3m3-3v8"
              />
            </svg>
            อัปเดตที่นั่ง
          </button>
        </div>
      </div>
    </div>
  );
}
