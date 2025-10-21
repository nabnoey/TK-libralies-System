import React from 'react'

const CardKaraoke = () => {
  return (
    <div className="card bg-blue-950 w-85 shadow-sm ">
  <figure>
    <img
      src="https://img.wongnai.com/p/624x0/2019/06/03/d7fb356d07f84684b3661fd6538d8ed3.jpg"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">โรงหนัง A1</h2>
    <p>ประเภท: โรงหนัง</p>

    
 <div className="flex items-center gap-2 bg-white w-22 rounded-xl">
  <i className="fa-solid fa-clock text-xl"></i>
  <span className="whitespace-nowrap text-black">6 คน</span>


    <div className="flex items-center gap-2 mx-1  text-[17px] ">
  <div className=" bg-white w-24 rounded-xl ml-7 w-25">
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

export default CardKaraoke