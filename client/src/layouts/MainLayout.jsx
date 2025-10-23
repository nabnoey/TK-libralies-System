import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // ใช้แสดงเนื้อหาของแต่ละหน้า

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-indigo-950">
      <Navbar />
      <main className="flex-grow">
        {/* เนื้อหาของหน้าแต่ละหน้า (React Router จะใส่แทน Outlet นี้) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
