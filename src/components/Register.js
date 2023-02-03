import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import { setDoc, doc } from "firebase/firestore";
import { UserContext } from "../contexts/UserContext";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [pass2, setPass2] = useState();
  const [error, setError] = useState();
  const { register } = useAuthentication();
  const { setCurrency } = useContext(UserContext);
  const currencies = ["usd$", "cad$", "gbp£"];
  const [RegCurr, setRegCurr] = useState(currencies[0]);

  async function handleRegister(e) {
    e.preventDefault();
    if (pass !== pass2) {
      setError("Passwords do not match");
      return;
    }
    await register(email, pass)
      .then(async (user) => {
        await setDoc(doc(db, "crypto-accounts", user.user.uid), {
          balance: 100000,
          currency: RegCurr,
        })
        setCurrency(RegCurr);
        setError();
        navigate(`/`);
      })
      .catch((e) => {
        setError(e.code);
      });
  }

  return (
    <div className="container">
      <div className="row">
        <div className="register-card">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
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
            <input
              type="password"
              className="form-control"
              placeholder="Retype Password"
              onChange={(event) => {
                setPass2(event.target.value);
              }}
              required
            />

            <select
              className="form-control curr-dropdown"
              onChange={(event) => {
                setRegCurr(event.target.value);
              }}
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr.toUpperCase()}
                </option>
              ))}
            </select>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
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
