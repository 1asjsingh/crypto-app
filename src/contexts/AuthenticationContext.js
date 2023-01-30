import React, { useContext, createContext, useEffect, useState } from "react";
import { auth, db } from "../components/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth"; //signout

const AuthenticationContext = createContext();

export function useAuthentication() {
  return useContext(AuthenticationContext);
}

export function AuthenticationProvider({ children }) {
  const [authedUser, setAuthedUser] = useState();

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function authSignOut() {
    return signOut(auth);
  }

  function setBalance() {
    return db.collection("crypto-accounts").doc(authedUser.uid).set({
      balance: 15000,
    });
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setAuthedUser(user);
    });
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{ authedUser, register, signIn, authSignOut, setBalance }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}
