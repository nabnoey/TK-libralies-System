import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const menuItems = [
    { name: "หน้าแรก", url: "/home" },
    { name: "ภาพยนตร์", url: "/home" },
    { name: "โรงภาพยนตร์", url: "/movies" },
    { name: "คาราโอเกะ", url: "/karaoke" },
  ];

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
        <Link to="/" className="btn btn-ghost text-xl">NPRU Booking</Link>
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
        <div className="form-control">
          <input
            type="text"
            placeholder="ค้นหา"
            className="input input-bordered w-32 md:w-64"
          />
        </div>

        <div className="indicator">
          {/* <span className="indicator-item badge badge-secondary">3</span> */}
          <button className="btn btn-ghost btn-circle" aria-label="Notifications">
            <i className="fa-solid fa-bell text-xl"></i>
          </button>
        </div>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a href="/user-profile">
                โปรไฟล์
                <span className="badge">ใหม่</span>
              </a>
            </li>
            <li>
              <a>ตั้งค่า</a>
            </li>
            <li>
              <a>ออกจากระบบ</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
