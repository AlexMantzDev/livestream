import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Auth/Pages/Login";
import { useAuth } from "./Shared/Contexts/useAuth";
import { useEffect } from "react";
import axios from "axios";
import PrivateRoute from "./Shared/Components/PrivateRoute";
import Home from "./Home/Pages/Home";
import Navbar from "./Shared/Components/Navbar";
import Watch from "./Watch/Pages/Watch";

const App = () => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/watch/:recordingId" element={<Watch />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
