import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css";
import { useAuthentication } from "../contexts/AuthenticationContext";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [error, setError] = useState();
  const { signIn } = useAuthentication();

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      await signIn(email, pass);
      setError();
      navigate(`/`);
    } catch (e) {
      setError(e.code);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="signin-card">
          <h2>Sign In</h2>
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
            />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(event) => {
                setPass(event.target.value);
              }}
              required
            />
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Link to="/register">Don't have an account?</Link>
            <button type="submit" className="btn signin-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
