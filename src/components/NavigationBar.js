import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar  from 'react-bootstrap/Navbar';
import { Button } from "react-bootstrap";
import { AiFillHome } from "react-icons/ai"
import { FaWallet, FaGamepad, FaHistory, FaTrophy } from "react-icons/fa"

function NavigationBar() {
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
    <Navbar expand="md">
      <Container>
        <Navbar.Brand className="logo m-auto" onClick={() => navigate(`/`)}>COINVERSE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="m-auto">
            <Nav.Link className="nav-link m-auto" onClick={() => navigate(`/`)}><AiFillHome /></Nav.Link>
            <Nav.Link className="nav-link m-auto" onClick={() => navigate(`/portfolio`)}><FaWallet /></Nav.Link>
            <Nav.Link className="nav-link m-auto" onClick={() => navigate(`/game`)}><FaGamepad /></Nav.Link>
            <Nav.Link className="nav-link m-auto" onClick={() => navigate(`/history`)}><FaHistory /></Nav.Link>
            <Nav.Link className="nav-link m-auto" onClick={() => navigate(`/leaderboard`)}><FaTrophy /></Nav.Link>
          </Nav>
          {authedUser ? (
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/signin`)}
          >
            Sign In
          </Button>
        )}  
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
