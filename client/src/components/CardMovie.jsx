import React from 'react'

const CardMovie = () => {
  return (
   <div className="card bg-blue-950 w-85 shadow-sm ">
  <figure>
    <img
      src="https://www.thaihealth.or.th/data/content/2020/05/52450/cms/newscms_thaihealth_c_hmnsuvw12457.jpg"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">โรงหนัง A1</h2>
    <p>ประเภท: โรงหนัง</p>

    
 <div className="flex items-center gap-2 bg-white w-24 rounded-xl">
  <i className="fa-solid fa-clock text-xl"></i>
  <span className="whitespace-nowrap text-black">6 ที่นั่ง</span>


    <div className="flex items-center gap-2 mx-1  text-[17px] ">
  <i className="fa-solid fa-volume-low"></i>
  <div className=" bg-white w-24 rounded-xl ml-1 w-25">
  <span className="whitespace-nowrap text-black ml-2">สถานะ :</span>
  <span className="whitespace-nowrap text-green-500"> ว่าง</span>
  </div>
</div>
</div>
    

    

    <div className="pt-10 ccd-actions justify-end w-100 ml-45 gap-5">
      <button className="btn bg-green-600 text-white rounded-xl order-2 border-white">จองห้อง</button>
    </div>
  </div>
</div>
  )
}

export default CardMovie