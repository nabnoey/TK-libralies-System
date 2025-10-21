import React from 'react'
import Navbar from '../components/Navbar'
import CardMovie from '../components/CardMovie'

function Movies() {
  return (
    <div className="bg-indigo-950">
    <Navbar />

    <div className="ml-5 mt-20 mb-10 text-white text-[30px] bold-5">
        <div className="text-center text-[50px]">รอบจองโรงหนัง</div>
    </div>

    <div className="pt-20 grid grid-cols-3 gap-10 mr-40 ml-55 mb-20">
        <CardMovie />
        <CardMovie />
        <CardMovie />
        <CardMovie />
        <CardMovie />
        <CardMovie />
        
    </div>
    </div>
  )
}

export default Movies