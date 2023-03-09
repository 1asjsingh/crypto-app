import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import {
  setDoc,
  doc,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { UserContext } from "../contexts/UserContext";
import { Container, Row, Form, Button, Alert } from "react-bootstrap";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [pass, setPass] = useState(null);
  const [pass2, setPass2] = useState(null);
  const [error, setError] = useState(null);
  const { register } = useAuthentication();
  const { setCurrency } = useContext(UserContext);
  const currencies = ["usd$", "cad$", "gbp£"];
  const [RegCurr, setRegCurr] = useState(currencies[0]);

  async function handleRegister(e) {
    try {
      e.preventDefault();

      if (pass !== pass2) {
        setError("Passwords do not match");
        return;
      }

      const usernameList = await getDocs(
        query(
          collection(db, "crypto-leaderboard"),
          where("usernameLC", "==", username.toLowerCase())
        )
      );

      if (usernameList.empty) {
        const user = await register(email, pass);

        await setDoc(doc(db, "crypto-accounts", user.user.uid), {
          balance: 100000,
          currency: RegCurr,
          username: username,
        });

        await setDoc(doc(db, "crypto-leaderboard", user.user.uid), {
          username: username,
          usernameLC: username.toLowerCase(),
          currency: RegCurr,
          score: 0,
          PL: 0,
        });

        setCurrency(RegCurr);
        setError();
        navigate(`/`);
      } else {
        setError("Username already exists");
        return;
      }
    } catch (e) {
      if ("auth/email-already-in-use" === String(e.code)) {
        setError("This email already exists");
      } else if ("auth/weak-password" === String(e.code)) {
        setError("Password is too weak");
      } else if ("auth/invalid-email" === String(e.code)) {
        setError("Invalid email");
      } else {
        setError(e.code);
      }
    }
  }

  return (
    <Container>
      <Row className="round-box">
        <Row>
          <h2>Register</h2>
        </Row>
        <Row>
          <Form onSubmit={handleRegister}>
            <Form.Control
              type="email"
              placeholder="Email Address"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
            />
            <Form.Control
              type="text"
              placeholder="Username"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              required
            />
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(event) => {
                setPass(event.target.value);
              }}
              required
            />
            <Form.Control
              type="password"
              placeholder="Retype Password"
              onChange={(event) => {
                setPass2(event.target.value);
              }}
              required
            />

            <Form.Select
              className="mb-2"
              onChange={(event) => {
                setRegCurr(event.target.value);
              }}
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr.toUpperCase()}
                </option>
              ))}
            </Form.Select>

            {error && <Alert variant={"danger"}>{error}</Alert>}
            <Form.Group>
              <Link className="ms-1" to="/signin">
                Already registered?
              </Link>
            </Form.Group>
            <Form.Group>
              <Button type="submit" className="mt-1 w-100">
                Register
              </Button>
            </Form.Group>
          </Form>
        </Row>
      </Row>
    </Container>
  );
}

export default Register;
