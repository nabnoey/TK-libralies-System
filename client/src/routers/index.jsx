import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Movies from "../pages/Movies.jsx";
import Karaoke from "../pages/Karaoke.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import Details from "../pages/Details.jsx";
import ReservationMovies from "../pages/ReservationMovies.jsx";
import ReservationKaraoke from "../pages/ReservationKaraoke.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import AddMovieSeat from "../pages/AddMovieSeat.jsx";
import AddKaraokeRoom from "../pages/AddKaraokeRoom.jsx";
import EditMovieSeat from "../pages/EditMovieSeat.jsx";
import EditKaraokeRoom from "../pages/EditKaraokeRoom.jsx";
import DetailsReservation from "../pages/DetailsReservation.jsx";
import MainLayout from "../layouts/MainLayout.jsx";

const router = createBrowserRouter([

{
path:"/",
element:<MainLayout />,
children: [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/movies",
    element: <Movies />,
  },
  {
    path: "/karaoke",
    element: <Karaoke />,
  },
  {
    path: "/user-profile",
    element: <UserProfile />,
  },

  {

    path: "/details/:id",
    element: <Details />,

  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/reservation-movies",
    element: <ReservationMovies />,
  },
  {

    path:"/reservation-karaoke/:roomid",  
    element:<ReservationKaraoke/>
  },

{
    path:"/add-movieSeat",  
    element:<AddMovieSeat/>

  },
  {
    path: "/add-movieSeat",
    element: <AddMovieSeat />,
  },
  {
    path: "/add-karaokeRoom",
    element: <AddKaraokeRoom />,
  },
  {
    path: "/edit-movieSeat",
    element: <EditMovieSeat />,
  },

  {
    path: "/edit-karaokeRoom",
    element: <EditKaraokeRoom />,
  },


  {
  path: "/details-reservation",
  element: <DetailsReservation />,
},

]}

])




export default router;
