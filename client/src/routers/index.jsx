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

import Details from "../pages/Details.jsx"; 
import Dashboard from "../pages/Dashboard.jsx";
import ReservationMovies from "../pages/ReservationMovies.jsx";
import ReservationKaraoke from "../pages/ReservationKaraoke.jsx";

>>>>>>> d21a4fd416bff6ab0c04990e80e32ee2f21dc689
import AddMovieSeat from "../pages/AddMovieSeat.jsx";
import AddKaraokeRoom from "../pages/AddKaraokeRoom.jsx";
import EditMovieSeat from "../pages/EditMovieSeat.jsx";
import EditKaraokeRoom from "../pages/EditKaraokeRoom.jsx";
<<<<<<< HEAD
import ReservationForm from "../pages/ReservationForm.jsx";
=======


>>>>>>> d21a4fd416bff6ab0c04990e80e32ee2f21dc689
const router = createBrowserRouter([
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
    path: "/login",
    element: <Login />,
  },
  {
<<<<<<< HEAD
    path: "/details/:id",
    element: <Details />,
=======

    path:"/details/:id",  
    element:<Details/>
>>>>>>> d21a4fd416bff6ab0c04990e80e32ee2f21dc689
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
<<<<<<< HEAD
    path: "/reservation-karaoke",
    element: <ReservationKaraoke />,
=======
    path:"/reservation-karaoke",  
    element:<ReservationKaraoke/>
  },

{
    path:"/add-movieSeat",  
    element:<AddMovieSeat/>
>>>>>>> d21a4fd416bff6ab0c04990e80e32ee2f21dc689
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
<<<<<<< HEAD
  {
    path: "/edit-karaokeRoom",
    element: <EditKaraokeRoom />,
  },
  {
  path: "/reservation-form",
  element: <ReservationForm />,
},
=======

])
>>>>>>> d21a4fd416bff6ab0c04990e80e32ee2f21dc689

]);

export default router;
