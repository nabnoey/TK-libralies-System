import { createBrowserRouter } from "react-router-dom";


import Home from "../pages/Home.jsx";
import Movies from "../pages/Movies.jsx";
import Karaoke from "../pages/Karaoke.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import Login from "../pages/Login.jsx";
import Details from "../pages/Details.jsx"; 
import Dashboard from "../pages/Dashboard.jsx";
import ReservationMovies from "../pages/ReservationMovies.jsx";
import ReservationKaraoke from "../pages/ReservationKaraoke.jsx";

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
])

export default router;