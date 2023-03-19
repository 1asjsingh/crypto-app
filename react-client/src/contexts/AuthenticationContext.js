import React, { useContext, createContext, useEffect, useState } from "react";
import { auth } from "../components/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "firebase/auth"; //signout

const AuthenticationContext = createContext();

export function useAuthentication() {
  return useContext(AuthenticationContext);
}

export function AuthenticationProvider({ children }) {
  const [authedUser, setAuthedUser] = useState({});
  const [loading, setLoading] = useState(true);

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function authSignOut() {
    return signOut(auth);
  }

  function deleteAuth() {
    return deleteUser(auth.currentUser);
  }

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthedUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return;

  return (
    <AuthenticationContext.Provider
      value={{ authedUser, register, signIn, authSignOut, deleteAuth }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}
