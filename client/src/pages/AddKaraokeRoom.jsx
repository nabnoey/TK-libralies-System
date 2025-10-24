import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import KaraokeService from "../services/karaoke.services";

export default function AddKaraokeRoom() {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
https://github.com/nabnoey/TK-libralies-System/pull/9/conflict?name=client%252Fsrc%252Fpages%252FEditKaraokeRoom.jsx&ancestor_oid=36e27498b7f4ceb99ab7b490d14b403bd0aa28e6&base_oid=a4719043acdb4c1d141006a5cf70c814e9934d24&head_oid=4b115e8ac8e5bee8da6868d9167a3facac651aad      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoom = async () => {
    if (!name.trim()) {
      await Swal.fire({
        title: "กรุณากรอกชื่อห้องคาราโอเกะ",
        icon: "warning",
        customClass: {
          popup: 'bg-white text-gray-800',
          title: 'text-gray-900',
        }
      });
      return;
    }

    if (!imageFile) {
      await Swal.fire({
        title: "กรุณาเลือกรูปภาพ",
        icon: "warning",
        customClass: {
          popup: 'bg-white text-gray-800',
          title: 'text-gray-900',
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: "คุณต้องการเพิ่มห้องคาราโอเกะหรือไม่?",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      icon: "question",
      customClass: {
        popup: 'bg-white text-gray-800',
        title: 'text-gray-900',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-ghost',
      }
    });

    if (result.isConfirmed) {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);

        // TODO: แทนที่ URL นี้ด้วย API endpoint ที่ถูกต้อง
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const response = await fetch(`https://tk-libralies-system.onrender.com/api/v1/karaoke-room`, {
          method: 'POST',
          body: formData,
          // ไม่ต้องใส่ Content-Type เพราะ browser จะใส่ให้พร้อม boundary
        });

        if (!response.ok) {
          throw new Error('Failed to create karaoke room');
        }

        await Swal.fire({
          title: "เพิ่มห้องคาราโอเกะสำเร็จแล้ว",
          icon: "success",
          customClass: {
            popup: 'bg-white text-gray-800',
            title: 'text-gray-900',
          }
        });

        navigate("/karaoke");
      } catch (error) {
        console.error('Error adding karaoke room:', error);
        await Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเพิ่มห้องคาราโอเกะได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
          customClass: {
            popup: 'bg-white text-gray-800',
            title: 'text-gray-900',
          }
        });
      }
    }
  };

  return (

    <div className="min-h-screen bg-base-200">


      <div className="max-w-2xl mx-auto my-12 p-8 card bg-base-100 shadow-xl border border-gray-300 rounded-box">
        <h2 className="text-center text-3xl font-extrabold mb-10 text-primary">
          เพิ่มห้องคาราโอเกะ 🎤
        </h2>

        <div className="space-y-7">

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                ชื่อห้องคาราโอเกะ <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ห้อง VIP-Gold, Karaoke Room A"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">
                รูปภาพห้องคาราโอเกะ <span className="text-error">*</span>
              </span>
            </label>
            <div
              className="flex justify-center items-center h-52 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-50 relative group"
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="opacity-0 absolute w-full h-full cursor-pointer z-10"
                onChange={handleImageChange}
              />
              {!imagePreview ? (
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
                  <p className="text-xs text-gray-400 mt-1">ไฟล์ที่รองรับ: JPG, PNG, GIF, WebP (ไม่เกิน 5MB)</p>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Karaoke Room Preview"
                  className="h-full w-full object-contain p-2 rounded-lg z-0"
                />
              )}
            </div>
          </div>
        </div>

        {/* ปุ่มเพิ่ม */}
        <div className="mt-10">
          <button
            className="btn btn-primary w-full text-lg font-bold"
            onClick={handleAddRoom}
            disabled={!name.trim() || !imageFile}
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
            เพิ่มห้องคาราโอเกะ
          </button>
        </div>
      </div>
    </div>
  );
}
