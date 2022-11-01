import React from "react";
import "./default-profile.png";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <p className="logo">COINVERSE</p>
      </div>

      <div className="profile">
        <img href="./default-profile.png" />
      </div>

      <div className="sign-in-button">
        <button type="button" className="btn btn-primary sign-in">
          Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
