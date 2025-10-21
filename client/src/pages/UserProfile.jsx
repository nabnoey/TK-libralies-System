import React from 'react'
import Navbar from '../components/Navbar'

function UserProfile() {
  return (
    <div className="bg-blue-900">
      <Navbar/>

      <div className="hero bg-base-200 min-h-screen ">
  <div className="hero-content flex-col lg:flex-row border-2 h-120 rounded-4xl">
    <img
      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
      className="max-w-sm rounded-lg shadow-3xl"
    />
    <div>
      <h1 className="text-[25px] font-bold">ชื่อ</h1>
      <span>นับทอง</span>
      <p className="py-6">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
        quasi. In deleniti eaque aut repudiandae et a id nisi.
      </p>
      <button className="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
    </div>
  )
}

export default UserProfile