import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMovies } from "../services/movieService";

const API_BASE = import.meta.env.VITE_AUTH_BASE;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Navbar = () => {
  const btnRef = useRef(null);
  const [me, setMe] = useState(null);
  const [jwt, setJwt] = useState(localStorage.getItem("token") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const baseItems = [
    { name: "หน้าแรก", url: "/" },
    { name: "โรงภาพยนตร์", url: "/movies" },
    { name: "คาราโอเกะ", url: "/karaoke" },
    { name: "ดูรอบการจอง", url: "/details-reservation" },
  ];

  const menuItems =
    me?.role === "admin"
      ? [
          baseItems.find((i) => i.url === "/") || { name: "Home", url: "/" },
          { name: "Dashboard", url: "/dashboard" },
        ]
      : baseItems;

  // ✅ รอให้ Google Auth โหลดก่อน
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

  // ✅ ดึงข้อมูลผู้ใช้จาก Token
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

  // ✅ โหลดรายชื่อภาพยนตร์ (ไว้ใช้ค้นหา)
  useEffect(() => {
    (async () => {
      try {
        const data = await getMovies();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("search preload error", err);
      }
    })();
  }, []);

  // ✅ ตั้งค่า Google Login
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

      // ✅ แสดงปุ่ม Login ถ้ายังไม่มี token
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

  // ✅ ออกจากระบบ
  const logout = () => {
    localStorage.removeItem("token");
    setJwt("");
    setMe(null);
    window.google?.accounts.id.disableAutoSelect();
    navigate("/"); // กลับหน้าแรก
  };

  // ✅ ค้นหาภาพยนตร์
  const filteredMovies = results.filter((m) =>
    (m?.title || "").toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectMovie = (id) => {
    setQuery("");
    setShowDropdown(false);
    if (id) navigate(`/details/${id}`);
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
          {/* 🔍 Search */}
          <div className="hidden md:flex items-center relative">
            <div className="flex items-center bg-white/90 rounded-full shadow-inner px-3 py-1.5 focus-within:ring-2 focus-within:ring-pink-400 transition w-60">
              <i className="fa-solid fa-magnifying-glass text-pink-600 mr-2"></i>
              <input
                type="text"
                placeholder="ค้นหาภาพยนตร์..."
                className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => query && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const first = filteredMovies[0];
                    if (first) handleSelectMovie(first.id);
                  }
                }}
              />
            </div>

            {/* Dropdown ผลลัพธ์ */}
            {showDropdown && query && (
              <ul className="absolute top-full mt-2 w-60 bg-white text-gray-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto border border-gray-200">
                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <li
                      key={movie.id}
                      onMouseDown={() => handleSelectMovie(movie.id)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="truncate">{movie.title}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-400 text-center">
                    ไม่พบผลลัพธ์
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* 🔐 โปรไฟล์ / ปุ่ม Login */}
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

              {/* dropdown โปรไฟล์ */}
              <div className="absolute right-0 mt-3 z-50 pb-6">
                <ul className="hidden group-hover:block w-56 bg-white text-gray-700 rounded-xl shadow-lg overflow-hidden pointer-events-auto transition-all duration-200 delay-200">
                  <li className="p-3 border-b border-gray-200 bg-gray-50">
                    <span className="block font-semibold text-black">
                      {me.name}
                    </span>
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
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 transition"
                    >
                      ออกจากระบบ
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ปุ่มเมนูมือถือ */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i
              className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}
            ></i>
          </button>
        </div>
      </div>

      {/* เมนูมือถือ */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-900 to-pink-700 border-t border-white/10 animate-fadeIn">
          <nav className="flex flex-col items-center py-4 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setMenuOpen(false)}
                className={`text-lg font-medium hover:text-yellow-200 ${
                  location.pathname === item.url
                    ? "text-yellow-300"
                    : "text-white"
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
