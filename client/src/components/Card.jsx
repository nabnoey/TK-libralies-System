import React from 'react'
import { Link } from 'react-router-dom'

const Card = ({ id,image, title }) => {
  return (
   <div className="card bg-blue-950 w-85 shadow-sm ">
  <figure>
 <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover rounded-t-lg"
        />
  </figure>
  <div className="card-body">
    <h2 className="card-title">{title}</h2>
   
   

    
 <div className="flex items-center gap-2">
  <i className="fa-regular fa-clock text-xl"></i>
  <span className="whitespace-nowrap">02 ชม. 30 นาที</span>
</div>
    
     <div className="flex items-center gap-2 mx-1">
  <i className="fa-solid fa-volume-low"></i>
  <span className="whitespace-nowrap">ไทย</span>
</div>
    

    <div className="pt-10 ccd-actions justify-end w-100 ml-45 gap-5">
      <Link to={`/details/${id}`} className="btn bg-amber-50 text-black rounded-xl">ดูเพิ่มเติม</Link>
    </div>
  </div>
</div>
  )
}

export default Card