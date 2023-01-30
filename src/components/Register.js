import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { useAuthentication } from "../contexts/AuthenticationContext";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [pass2, setPass2] = useState();
  const [error, setError] = useState();
  const { register, setBalance } = useAuthentication();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      if (pass !== pass2) {
        setError('Passwords do not match')
        return
      }
      await register(email, pass);
      //await setBalance();
      setError()
      navigate(`/`);
    }
    catch (e) {
      setError(e.code);
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="register-card">
          <h2>Register</h2>
          <form onSubmit={ handleRegister }>
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              onChange={(event) => {setEmail(event.target.value)}}
              required
            />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(event) => {setPass(event.target.value)}}
              required
            />
            <input
              type="password"
              className="form-control"
              placeholder="Retype Password"
              onChange={(event) => {setPass2(event.target.value)}}
              required
            />
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <Link to="/signin">Already registered?</Link>
            <button type="submit" className="btn register-button">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
