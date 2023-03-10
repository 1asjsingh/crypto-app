import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignIn.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import { getDoc, doc } from "firebase/firestore";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [error, setError] = useState();
  const { signIn } = useAuthentication();

  async function handleSignIn(e) {
    try {
      e.preventDefault();
      const user = await signIn(email, pass);
      const userData = await getDoc(doc(db, "crypto-accounts", user.user.uid));
      if (userData.exists()) {
        //setCurrency(userData.data().currency);
        localStorage.setItem("currency", userData.data().currency);
      } else {
        setError("An error occured"); //CHANGE-----------------------
      }
      setError();
      navigate(`/`);
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
