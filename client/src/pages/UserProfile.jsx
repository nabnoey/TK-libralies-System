import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthService from "../services/auth.services";

function UserProfile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jwt = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    const fetchMe = async () => {
      if (!jwt) {
        setLoading(false);
        return;
      }
      try {
        const data = await AuthService.getMe(jwt);
        setMe(data);
        setError("");
      } catch (e) {
        console.error("❌ โหลดข้อมูลผู้ใช้ล้มเหลว:", e);
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "ไม่สามารถโหลดข้อมูลผู้ใช้ได้"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [jwt]);

  const lastReservation = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("lastReservation"));
    } catch {
      return null;
    }
  }, []);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const bookingLocked = useMemo(() => {
    try {
      const locked = localStorage.getItem("bookingLockDate");
      return locked === todayKey;
    } catch {
      return false;
    }
  }, [todayKey]);

  const handleCancel = async () => {
    const res = await Swal.fire({
      title: "ยืนยันยกเลิกรายการจองล่าสุด?",
      text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้",
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
      title: "ลบรายการจองล่าสุดแล้ว",
      icon: "success",
      confirmButtonColor: "#f472b6",
    });

    navigate("/details-reservation", { replace: true });
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white">
      <div className="max-w-5xl mx-auto px-6 pt-45 pb-10">
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
              {/* 🔹 โปรไฟล์ผู้ใช้ */}
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-20 rounded-full">
                    <img
                      src={
                        me?.avatar ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt={me?.name || "User avatar"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xl font-bold">
                    {me?.name || "ไม่ระบุชื่อ"}
                  </div>
                  <div className="opacity-70">{me?.email}</div>
                  <div className="badge badge-secondary mt-2">
                    {me?.role || "user"}
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* 🔹 ข้อมูลเพิ่มเติม */}
              <div className="grid md:grid-cols-2 gap-6 ml-25">
                <div className="bg-base-200 rounded-xl p-4">
                  <div className="font-semibold mb-2">ข้อมูลบัญชี</div>
                  <div>
                    <b>รหัสผู้ใช้:</b> {me?.userId ?? "-"}
                  </div>
                  <div>
                    <b>เข้าสู่ระบบด้วย:</b> {me?.provider ?? "-"}
                  </div>
                  {me?.lastLoginAt && (
                    <div>
                      <b>เข้าสู่ระบบล่าสุด:</b>{" "}
                      {new Date(me.lastLoginAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* 🔹 ปุ่มออกจากระบบ */}
              <div className="mt-6">
                <button
                  onClick={async () => {
                    const res = await Swal.fire({
                      title: "ยืนยันการออกจากระบบ?",
                      text: "คุณต้องการออกจากระบบตอนนี้หรือไม่?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#ef4444",
                      cancelButtonColor: "#6b7280",
                      confirmButtonText: "ออกจากระบบ",
                      cancelButtonText: "ยกเลิก",
                    });

                    if (!res.isConfirmed) return;

                    AuthService.logout();

                    await Swal.fire({
                      title: "ออกจากระบบแล้ว",
                      icon: "success",
                      confirmButtonColor: "#f472b6",
                    });

                    navigate("/");
                  }}
                  className="btn bg-red-600 text-white ml-25"
                >
                  ออกจากระบบ
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
