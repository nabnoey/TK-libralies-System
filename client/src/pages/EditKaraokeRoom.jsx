import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import KaraokeService from "../services/karaoke.services";
import { useNavigate, useParams } from "react-router-dom";

export default function EditKaraokeRoom() {
  const { roomId } = useParams();

  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [roomStatus, setRoomStatus] = useState("available");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // 🔹 จำลองข้อมูลห้อง (ในอนาคตใช้ getById แทน mock)
  useEffect(() => {
    const mockRoomData = {
      name: "VIP-Gold (ห้อง 3)",
      status: "occupied",
      imageUrl:
        "https://img.wongnai.com/p/1600x0/2019/06/03/d7fb356d07f84684b3661fd6538d8ed3.jpg",
    };

    setRoomName(mockRoomData.name);
    setRoomStatus(mockRoomData.status);
    setRoomImage(mockRoomData.imageUrl);
    setIsLoading(false);
  }, [roomId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setRoomImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateRoom = async () => {
    const result = await Swal.fire({
      title: "คุณต้องการอัปเดตข้อมูลห้องคาราโอเกะนี้หรือไม่?",
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
      // ✅ เรียก service update
      await KaraokeService.editKaraoke(roomId, {
        name: roomName,
        image: roomImage,
        status: roomStatus,
      });

      await Swal.fire({
        title: "แก้ไขห้องคาราโอเกะสำเร็จแล้ว 🎉",
        icon: "success",
        customClass: {
          popup: "bg-white text-gray-800",
          title: "text-gray-900",
        },
      });

      navigate("/karaoke");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: error?.response?.data?.message || "อัปเดตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-3 text-lg">กำลังโหลดข้อมูลห้องคาราโอเกะ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-2xl mx-auto my-12 p-8 card bg-base-100 shadow-xl border border-gray-300 rounded-box">
        <h2 className="text-center text-3xl font-extrabold mb-10 text-primary">
          แก้ไขห้องคาราโอเกะ: {roomName} 🎤
        </h2>

        <div className="space-y-7">
          {/* ชื่อห้อง */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                ชื่อห้องคาราโอเกะ <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-gray-800"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="เช่น ห้อง VIP-Gold"
              required
            />
          </div>

          {/* รูปภาพ */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                รูปภาพห้องคาราโอเกะ <span className="text-error">*</span>
              </span>
            </label>
            <div className="flex justify-center items-center h-52 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-50 relative group">
              <input
                type="file"
                accept="image/*"
                className="opacity-0 absolute w-full h-full cursor-pointer z-10"
                onChange={handleImageChange}
              />
              {!roomImage ? (
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
                  src={roomImage}
                  alt="Room Preview"
                  className="h-full w-full object-contain p-2 rounded-lg z-0"
                />
              )}
            </div>
          </div>

          {/* สถานะ */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                สถานะห้อง
              </span>
            </label>
            <select
              className="select select-bordered w-full text-gray-800"
              value={roomStatus}
              onChange={(e) => setRoomStatus(e.target.value)}
            >
              <option value="available">ว่าง (Available)</option>
              <option value="occupied">ไม่ว่าง/ถูกจอง (Occupied)</option>
              <option value="unavailable">ปิดปรับปรุง/ไม่พร้อมใช้งาน (Unavailable)</option>
            </select>
          </div>
        </div>

        {/* ปุ่มอัปเดต */}
        <div className="mt-10">
          <button
            className="btn btn-primary w-full text-lg font-bold"
            onClick={handleUpdateRoom}
            disabled={!roomImage || !roomName}
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
            อัปเดตห้องคาราโอเกะ
          </button>
        </div>
      </div>
    </div>
  );
}
