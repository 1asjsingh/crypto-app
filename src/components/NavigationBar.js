import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar  from 'react-bootstrap/Navbar';
import { Button } from "react-bootstrap";

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
        <Navbar.Brand className="logo" onClick={() => navigate(`/`)}>COINVERSE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className="nav-links" onClick={() => navigate(`/`)}>Coins</Nav.Link>
            <Nav.Link onClick={() => navigate(`/portfolio`)}>Portfolio</Nav.Link>
            <Nav.Link onClick={() => navigate(`/game`)}>Game</Nav.Link>
            <Nav.Link onClick={() => navigate(`/history`)}>History</Nav.Link>
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
