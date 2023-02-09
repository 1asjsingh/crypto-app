import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuthentication } from "../contexts/AuthenticationContext";

function Navbar() {
  const navigate = useNavigate();
  const { authedUser, authSignOut } = useAuthentication();

  async function handleSignOut() {
    try {
      await authSignOut();
    } catch (e) {
      alert(e.code);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <p className="logo" onClick={() => navigate(`/`)}>
          COINVERSE
        </p>
      </div>

      <div>
      <p className="logo" onClick={() => navigate(`/portfolio`)}>
          Port
        </p>
      </div>

      <div className="sign-button">
        {authedUser ? (
          <button type="button" className="btn sign" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            className="btn sign"
            onClick={() => navigate(`/signin`)}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
