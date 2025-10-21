import { createBrowserRouter } from "react-router-dom";

import Index from "../pages/index.jsx";
import Home from "../pages/Home.jsx";
import Movies from "../pages/Movies.jsx";
import Karaoke from "../pages/Karaoke.jsx";
import UserProfile from "../pages/UserProfile.jsx";
import Login from "../pages/Login.jsx";

const router = createBrowserRouter([
  {
    path:"/",
    element:<Index/>
  },

  {
    path:"/home",
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
  }
])

export default router;