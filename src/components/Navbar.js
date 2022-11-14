import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <p className="logo" onClick={() => navigate(`/`)}>COINVERSE</p>
      </div>

      <div className="sign-in-button">
        <button type="button" className="btn sign-in">
          Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
