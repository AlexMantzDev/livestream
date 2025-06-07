import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Login from "./Auth/Pages/Login";
import { useAuth } from "./Shared/Contexts/useAuth";
import { useEffect } from "react";
import axios from "axios";
import PrivateRoute from "./Shared/Components/PrivateRoute";

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
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/dashboard"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<h1>Register Page</h1>} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <h1>User Profile</h1>
            </PrivateRoute>
          }
        />
        <Route path="/settings" element={<h1>Settings</h1>} />
        <Route path="/about" element={<h1>About Us</h1>} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
