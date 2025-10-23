import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Navbar = () => {
  const btnRef = useRef(null);
  const [me, setMe] = useState(null);
  const [jwt, setJwt] = useState(localStorage.getItem("token") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "หน้าแรก", url: "/" },
    { name: "โรงภาพยนตร์", url: "/movies" },
    { name: "คาราโอเกะ", url: "/karaoke" },
    { name: "ดูรอบการจอง", url: "/details-reservation" },
  ];

  if (me?.role === "admin") {
    menuItems.push({ name: "Dashboard", url: "/dashboard" });
  }

  const waitForGoogle = () =>
    new Promise((resolve) => {
      if (window.google?.accounts?.id) return resolve();
      const id = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(id);
          resolve();
        }
      }, 50);
      setTimeout(() => clearInterval(id), 10000);
    });

  useEffect(() => {
    (async () => {
      await waitForGoogle();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const res = await fetch(`${API_BASE}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");

            localStorage.setItem("token", data.token);
            setJwt(data.token);
            fetchMe(data.token);
          } catch (e) {
            console.error(e);
            alert(e.message || "Login failed");
          }
        },
      });

      if (btnRef.current && !jwt) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "medium",
          shape: "pill",
          text: "signin_with",
        });
      }
    })();

    if (jwt) fetchMe(jwt);
  }, [jwt]);

  const fetchMe = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMe(data);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setJwt("");
    setMe(null);
    window.google?.accounts.id.disableAutoSelect();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-700 text-white shadow-lg backdrop-blur-md border-b border-white/10 transition-all">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        {/* โลโก้ */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold tracking-wide hover:text-pink-200 transition-all"
        >
          🎬 NPRU <span className="text-pink-300">Booking</span>
        </Link>

        {/* เมนูหลัก (Desktop) */}
        <nav className="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.url}
              className={`text-sm font-semibold tracking-wide hover:text-yellow-300 transition relative ${
                location.pathname === item.url
                  ? "after:absolute after:w-full after:h-[2px] after:bg-yellow-300 after:bottom-[-4px] after:left-0"
                  : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ส่วนขวา */}
        <div className="flex items-center gap-4">
          {/* 🔍 ช่องค้นหา (Desktop) */}
          <div className="hidden md:flex items-center bg-white/90 rounded-full shadow-inner px-3 py-1.5 focus-within:ring-2 focus-within:ring-pink-400 transition">
            <i className="fa-solid fa-magnifying-glass text-pink-600 mr-2"></i>
            <input
              type="text"
              placeholder="ค้นหา..."
              className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-40 md:w-56"
            />
          </div>

          {/* โปรไฟล์ / ปุ่ม Login */}
          {!jwt || !me ? (
            <div ref={btnRef} className="ml-2" />
          ) : (
            <div className="relative group">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full ring-2 ring-pink-400">
                  <img
                    alt={me.name || "User avatar"}
                    src={
                      me.avatar ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              {/* dropdown */}
              <ul className="hidden group-hover:block absolute right-0 mt-3 w-56 bg-white text-gray-700 rounded-xl shadow-lg overflow-hidden">
                <li className="p-3 border-b border-gray-200 bg-gray-50">
                  <span className="block font-semibold text-black">{me.name}</span>
                  <span className="block text-xs opacity-70">{me.email}</span>
                </li>
                <li>
                  <Link
                    to="/user-profile"
                    className="block px-4 py-2 hover:bg-pink-50 transition"
                  >
                    โปรไฟล์ของฉัน
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 transition"
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* ปุ่มเมนู (Mobile) */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* เมนู Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-900 to-pink-700 border-t border-white/10 animate-fadeIn">
          <nav className="flex flex-col items-center py-4 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setMenuOpen(false)}
                className={`text-lg font-medium hover:text-yellow-200 ${
                  location.pathname === item.url ? "text-yellow-300" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out;
          }
        `}
      </style>
    </header>
  );
};

export default Navbar;
