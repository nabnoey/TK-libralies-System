import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router";
import router from "./routers/index.jsx";
import "./App.css";
// import Navbar from './components/Navbar.jsx';


createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <Navbar/> */}
    <RouterProvider router={router} />

  </StrictMode>
);
