import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/Home.jsx";
import Movies from "../pages/Movies.jsx";
import Karaoke from "../pages/Karaoke.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import Login from "../pages/Login.jsx";
import Details from "../pages/Details.jsx";
import ReservationMovies from "../pages/ReservationMovies.jsx";
import ReservationKaraoke from "../pages/ReservationKaraoke.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import AddMovieSeat from "../pages/AddMovieSeat.jsx";
import AddKaraokeRoom from "../pages/AddKaraokeRoom.jsx";
import EditMovieSeat from "../pages/EditMovieSeat.jsx";
import EditKaraokeRoom from "../pages/EditKaraokeRoom.jsx";
import DetailsReservation from "../pages/DetailsReservation.jsx";
import FormReservationKaraoke from "../pages/FormReservationKaraoke.jsx";

import ReservationForm from "../pages/ReservationForm.jsx";
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

    path:"/reservation-karaoke",  
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
  path: "/reservation-form",
  element: <ReservationForm />,
},

  {
  path: "/details-reservation",
  element: <DetailsReservation />,
},
{
  path:"/reservation-karaoke/:roomId",
  element:<FormReservationKaraoke />
}


])




export default router;
