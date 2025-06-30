import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Auth/Pages/Login";
import { useAuth } from "./Shared/Contexts/Auth/AuthContext";
import { useEffect } from "react";
import axios from "axios";
import PrivateRoute from "./Shared/Components/PrivateRoute";
import Home from "./Home/Pages/Home";
import Navbar from "./Shared/Components/Navbar";
import { Profile } from "./Profile/Pages/Profile";
import { Watch } from "./Watch/Pages/Watch";
import SocketTest from "./Shared/socketTest";

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
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/watch/:recordingId" element={<Watch />} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </div>
      </div>
      <SocketTest />
    </BrowserRouter>
  );
};

export default App;
