import React from 'react'

const Card = () => {
  return (
   <div className="card bg-blue-950 w-85 shadow-sm ">
  <figure>
    <img
      src="https://cms.dmpcdn.com/dara/2024/08/08/39f37330-5552-11ef-bc34-1f5c3bc9eab0_webp_original.webp"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">ธี่หยด2</h2>
    <p>ประเภท: ระทึกขวัญ</p>

    
 <div className="flex items-center gap-2">
  <i className="fa-regular fa-clock text-xl"></i>
  <span className="whitespace-nowrap">02 ชม. 30 นาที</span>
</div>
    
     <div className="flex items-center gap-2 mx-1">
  <i className="fa-solid fa-volume-low"></i>
  <span className="whitespace-nowrap">ไทย</span>
</div>
    

    <div className="pt-10 ccd-actions justify-end w-100 ml-45 gap-5">
      <button className="btn bg-amber-50 text-black rounded-xl">ดูเพิ่มเติม</button>
    </div>
  </div>
</div>
  )
}

export default Card