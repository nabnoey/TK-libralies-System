import React from 'react'
import "../App.css";
import { Link } from "react-router-dom";
function index() {
  return (

    //หน้าต้อนรับ
    <div
  className="hero min-h-screen"
  style={{
    backgroundImage:
      "url(https://www.thaihealth.or.th/data/content/2020/05/52450/cms/newscms_thaihealth_c_hmnsuvw12457.jpg)",
  }}
>
  <div className="hero-overlay"></div>
<div className="hero-overlay bg-opacity-60"></div>
  <div className="hero-content text-center text-neutral-content">
    <div className="max-w-4xl">
      <h1 className="mb-5 text-[96px] font-bold whitespace-nowrap text-center leading-none">
        Hello there
      </h1>
      <p className="mb-5 text-[40px] whitespace-nowrap  text-left-20">
        ยินดีต้อนรับเข้าสู่ระบบจองที่นั่งโรงภาพยนตร์และห้องคาราโอเกะ NPRU
      </p>
      <Link to="/home" className="btn btn-primary  mt-30">
            Get Started
          </Link>
    </div>
  </div>
</div>

  )
}

export default index