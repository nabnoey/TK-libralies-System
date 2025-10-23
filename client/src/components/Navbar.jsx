import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Navbar = () => {
  const btnRef = useRef(null);
  const [me, setMe] = useState(null);
  const [jwt, setJwt] = useState(localStorage.getItem("token") || "");

  // สำหรับ dropdown search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "หน้าแรก", url: "/" },
    { name: "ภาพยนตร์", url: "/" },
    { name: "โรงภาพยนตร์", url: "/movies" },
    { name: "คาราโอเกะ", url: "/karaoke" },
    { name: "ดูรอบการจอง", url: "/details-reservation" },
  ];

  if (me?.role === "admin") {
    menuItems.push({ name: "Dashboard", url: "/dashboard" });
  }

  // รอจนสคริปต์ Google Identity Services โหลดเสร็จ
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

  // ดึงข้อมูล user
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

  // ดึงข้อมูลหนังทั้งหมด
  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE}/movies`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("fetchMovies error:", err);
    }
  };

  useEffect(() => {
    fetchMovies();
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
        auto_select: false,
        context: "signin",
        itp_support: true,
      });

      if (btnRef.current && !jwt) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "medium",
          text: "signin_with",
          shape: "pill",
        });
      }
    })();

    if (jwt) {
      fetchMe(jwt);
    }
  }, [jwt]);

  const logout = () => {
    localStorage.removeItem("token");
    setJwt("");
    setMe(null);
    window.google?.accounts.id.disableAutoSelect();
  };

  const filteredMovies = results.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectMovie = (id) => {
    setQuery("");
    setShowDropdown(false);
    navigate(`/details/${id}`);
  };

  return (
    <div className="navbar bg-base-100 shadow-sm py-5 px-10">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link to={item.url}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          NPRU Booking
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex mr-145">
        <ul className="menu menu-horizontal px-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link to={item.url}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Dropdown Search */}
        <div className="form-control relative">
          <input
            type="text"
            placeholder="ค้นหาภาพยนตร์..."
            className="input input-bordered w-32 md:w-64"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onFocus={() => query && setShowDropdown(true)}
          />

          {showDropdown && query && (
            <ul className="absolute top-full left-0 mt-1 w-full bg-base-100 border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <li
                    key={movie.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectMovie(movie.id)}
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <span className="truncate">{movie.title}</span>
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-400 text-sm text-center">
                  ไม่พบภาพยนตร์
                </li>
              )}
            </ul>
          )}
        </div>

        {!jwt || !me ? (
          <div ref={btnRef} className="ml-2" />
        ) : (
          <>
            <div className="indicator">
              <button
                className="btn btn-ghost btn-circle"
                aria-label="Notifications"
              >
                <i className="fa-solid fa-bell text-xl"></i>
              </button>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
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
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li className="menu-title">
                  <span>{me.name}</span>
                  <span className="text-xs opacity-60">{me.email}</span>
                </li>
                <li>
                  <Link to="/user-profile">โปรไฟล์</Link>
                </li>
                <li>
                  <a onClick={logout}>ออกจากระบบ</a>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
