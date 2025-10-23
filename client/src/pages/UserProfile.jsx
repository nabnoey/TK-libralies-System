import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE;

function UserProfile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jwt, setJwt] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const fetchMe = async () => {
      if (!jwt) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "โหลดข้อมูลผู้ใช้ล้มเหลว");
        setMe(data);
      } catch (e) {
        setError(e.message || "โหลดข้อมูลผู้ใช้ล้มเหลว");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
    const onFocus = () => setJwt(localStorage.getItem("token") || "");
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [jwt]);

  const lastReservation = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("lastReservation"));
    } catch  {
      return null;
    }
  }, []);

  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }, []);

  const bookingLocked = useMemo(() => {
    try {
      const locked = localStorage.getItem("bookingLockDate");
      return locked === todayKey;
    } catch  {
      return false;
    }
  }, [todayKey]);

  const handleCancel = async () => {
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
    } catch  { /* ignore */ }
    await Swal.fire({ title: "ยกเลิกสำเร็จ", icon: "success", confirmButtonColor: "#f472b6" });
    navigate("/details-reservation", { replace: true });
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white">
    
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-10">
        <h1 className="text-3xl font-bold mb-6">โปรไฟล์ผู้ใช้</h1>

        {loading ? (
          <div className="skeleton h-24 w-full" />
        ) : !jwt ? (
          <div className="alert alert-info bg-blue-800">
            <span>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</span>
          </div>
        ) : error ? (
          <div className="alert alert-error bg-red-800">
            <span>{error}</span>
          </div>
        ) : (
          <div className="card bg-base-100 text-amber-50 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-20 rounded-full">
                    <img
                      src={me?.avatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                      alt={me?.name || "avatar"}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">{me?.name || "ไม่ระบุชื่อ"}</div>
                  <div className="opacity-70">{me?.email}</div>
                  <div className="badge badge-secondary mt-2">{me?.role || "user"}</div>
                </div>
              </div>

              <div className="divider" />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-base-200 rounded-xl p-4">
                  <div className="font-semibold mb-2">สถานะสิทธิ์วันนี้</div>
                  {bookingLocked ? (
                    <div className="text-green-600">ใช้สิทธิ์แล้ว (1 รอบ/วัน)</div>
                  ) : (
                    <div className="text-gray-300">ยังไม่ใช้สิทธิ์ (สามารถจองได้ 1 รอบ/วัน)</div>
                  )}
                </div>

                <div className="bg-base-200 rounded-xl p-4">
                  <div className="font-semibold mb-2">การจองล่าสุด</div>
                  {lastReservation ? (
                    <div>
                      <div>สถานที่: {lastReservation.theater}</div>
                      <div>รายละเอียด: {(lastReservation.seats || []).join(", ")}</div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate("/details-reservation")}
                          className="btn btn-sm bg-pink-500 text-white"
                        >
                          ดูรายละเอียด
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn btn-sm bg-red-500 text-white"
                        >
                          ยกเลิกการจอง
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700">ยังไม่มีข้อมูลการจอง</div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => navigate("/movies")} className="btn bg-pink-500 text-white">
                  ไปจองรอบโรงหนัง
                </button>
                <button onClick={() => navigate("/karaoke")} className="btn bg-indigo-500 text-white">
                  ไปจองห้องคาราโอเกะ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;



