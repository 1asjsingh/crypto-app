import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthentication } from "./AuthenticationContext";

const ProtectedRoutes = () => {
  const { authedUser } = useAuthentication();
  return authedUser ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoutes;
