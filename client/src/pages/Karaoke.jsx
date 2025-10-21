import React from 'react'
import Navbar from '../components/Navbar'
import CardKaraoke from '../components/CardKaraoke.jsx'

function Karaoke() {
  return (
    <div className="bg-indigo-950">
 <Navbar />

  <div className="ml-5 mt-20 mb-10 text-white text-[30px] bold-5">
        <div className="text-center text-[50px]">รอบจองห้องคาราโอเกะ</div>
    </div>
 <div className="pt-20 grid grid-cols-3 gap-10 mr-40 ml-55 mb-20">
<CardKaraoke /> <CardKaraoke /> <CardKaraoke /> <CardKaraoke /> <CardKaraoke /> <CardKaraoke />

 </div>

</div>
 
  )
}

export default Karaoke