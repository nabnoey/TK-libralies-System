import { createBrowserRouter } from "react-router-dom";


import Home from "../pages/Home.jsx";
import Movies from "../pages/Movies.jsx";
import Karaoke from "../pages/Karaoke.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import Login from "../pages/Login.jsx";
<<<<<<< HEAD
import Details from "../pages/Details.jsx"; 
import Dashboard from "../pages/Dashboard.jsx";
import ReservationMovies from "../pages/ReservationMovies.jsx";
import ReservationKaraoke from "../pages/ReservationKaraoke.jsx";
=======
import AddMovieSeat from "../pages/AddMovieSeat.jsx";
import AddKaraokeRoom from "../pages/AddKaraokeRoom.jsx";
import EditMovieSeat from "../pages/EditMovieSeat.jsx";
import EditKaraokeRoom from "../pages/EditKaraokeRoom.jsx";
>>>>>>> feature/movie-seats

const router = createBrowserRouter([


  {
    path:"/",
    element:<Home/>
  },

  {
    path:"/movies",
    element:<Movies/>
  },

  {
    path:"/karaoke",
    element:<Karaoke/>
  },

  {
    path:"/user-profile",
    element:<UserProfile/>
  },

  {
    path:"/login",  
    element:<Login/>
  },

  {
<<<<<<< HEAD
    path:"/details/:id",  
    element:<Details/>
  },

  {
    path:"/dashboard",  
    element:<Dashboard/>
  },

  {
    path:"/reservation-movies",  
    element:<ReservationMovies/>
  },

  {
    path:"/reservation-karaoke",  
    element:<ReservationKaraoke/>
  }
=======
    path:"/add-movieSeat",  
    element:<AddMovieSeat/>
  },

  {
    path:"/add-karaokeRoom",  
    element:<AddKaraokeRoom/>
  },

  {
    path:"/edit-movieSeat",  
    element:<EditMovieSeat/>
  },

  {
    path:"/edit-karaokeRoom",  
    element:<EditKaraokeRoom/>
  },
>>>>>>> feature/movie-seats
])

export default router;