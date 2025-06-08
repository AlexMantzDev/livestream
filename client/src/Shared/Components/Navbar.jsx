import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/useAuth";

const Navbar = () => {
  const { user, setUser } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/logout"); // Adjust this endpoint!
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Clear user state
    setUser(null);

    // Remove token from local storage
    localStorage.removeItem("token");

    // Redirect to home
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Streamify
        </Link>
        <div>
          {user ? (
            <div className="d-flex align-items-center">
              <Link className="btn btn-outline-primary me-2" to="/profile">
                {user.username || user.email}
              </Link>
              <Link
                to="#"
                className="btn btn-outline-danger me-2"
                onClick={(e) => handleLogout(e)}
              >
                Logout
              </Link>
            </div>
          ) : (
            <>
              <Link className="btn btn-outline-primary me-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-outline-secondary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
