import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { AiFillHome } from "react-icons/ai";
import {
  FaWallet,
  FaGamepad,
  FaHistory,
  FaTrophy,
  FaCog,
} from "react-icons/fa";

function NavigationBar() {
  const navigate = useNavigate();
  const { authedUser, authSignOut } = useAuthentication();
  const [show, setShow] = useState(false);
  const [dashboardView, setDashboardView] = useState(
    localStorage.getItem("dashboardView") || "g"
  );
  const [chartView, setChartView] = useState(
    localStorage.getItem("chartView") || "l"
  );

  async function handleSignOut() {
    try {
      await authSignOut();
    } catch (e) {
      console.error(e);
    }
  }

  const handleClose = () => window.location.reload(false);

  const handleShow = () => setShow(true);

  function handleDashboardView(e) {
    setDashboardView(e.target.value);
    localStorage.setItem("dashboardView", e.target.value);
  }

  function handleChartView(e) {
    setChartView(e.target.value);
    localStorage.setItem("chartView", e.target.value);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Label>Dashboard View</Form.Label>
                <Form.Check
                  type="radio"
                  name="dashboardView"
                  label="Grid"
                  value="g"
                  checked={dashboardView === "g"}
                  onChange={handleDashboardView}
                />
                <Form.Check
                  type="radio"
                  name="dashboardView"
                  label="Table"
                  value="t"
                  checked={dashboardView === "t"}
                  onChange={handleDashboardView}
                />
              </Col>
              <Col>
                <Form.Label>Chart View</Form.Label>
                <Form.Check
                  type="radio"
                  name="chartView"
                  label="Line"
                  value="l"
                  checked={chartView === "l"}
                  onChange={handleChartView}
                />
                <Form.Check
                  type="radio"
                  name="chartView"
                  label="Candlestick"
                  value="c"
                  checked={chartView === "c"}
                  onChange={handleChartView}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Navbar expand="md">
        <Container>
          <Navbar.Brand className="logo m-auto" onClick={() => navigate(`/`)}>
            COINVERSE
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="m-auto">
              <Nav.Link
                className="nav-link m-auto"
                onClick={() => navigate(`/`)}
              >
                <AiFillHome />
              </Nav.Link>
              <Nav.Link
                className="nav-link m-auto"
                onClick={() => navigate(`/portfolio`)}
              >
                <FaWallet />
              </Nav.Link>
              <Nav.Link
                className="nav-link m-auto"
                onClick={() => navigate(`/game`)}
              >
                <FaGamepad />
              </Nav.Link>
              <Nav.Link
                className="nav-link m-auto"
                onClick={() => navigate(`/history`)}
              >
                <FaHistory />
              </Nav.Link>
              <Nav.Link
                className="nav-link m-auto"
                onClick={() => navigate(`/leaderboard`)}
              >
                <FaTrophy />
              </Nav.Link>
              <Nav.Link className="nav-link m-auto" onClick={handleShow}>
                <FaCog />
              </Nav.Link>
            </Nav>
            {authedUser ? (
              <Button onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <Button onClick={() => navigate(`/signin`)}>Sign In</Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavigationBar;
