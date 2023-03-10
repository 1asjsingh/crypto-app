import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import { getDoc, doc } from "firebase/firestore";
import { Alert, Button, Container, Row, Form } from "react-bootstrap";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [error, setError] = useState();
  const { signIn, authedUser } = useAuthentication();

  async function handleSignIn(e) {
    try {
      if (authedUser) {
        alert("You are already logged in");
        navigate(`/`);
      } else {
        e.preventDefault();
        const user = await signIn(email, pass);
        const userData = await getDoc(
          doc(db, "crypto-accounts", user.user.uid)
        );
        localStorage.setItem("currency", userData.data().currency);
        setError();
        navigate(`/`);
      }
    } catch (e) {
      if ("auth/user-not-found" === String(e.code)) {
        setError("Email not found. Please register");
      } else if ("auth/wrong-password" === String(e.code)) {
        setError("Incorrect password");
      } else {
        setError(e.code);
      }
    }
  }

  return (
    <Container>
      <Row className="round-box">
        <Row>
          <h2>Sign In</h2>
        </Row>
        <Row>
          <Form onSubmit={handleSignIn}>
            <Form.Control
              type="email"
              placeholder="Email Address"
              onChange={(event) => {
                setEmail(event.target.value);
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
            {error && <Alert variant={"danger"}>{error}</Alert>}
            <Form.Group>
              <Link className="ms-1" to="/register">
                Don't have an account?
              </Link>
            </Form.Group>
            <Form.Group>
              <Button type="submit" className="mt-1 w-100">
                Sign In
              </Button>
            </Form.Group>
          </Form>
        </Row>
      </Row>
    </Container>
  );
}

export default SignIn;
