import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthentication } from "./AuthenticationContext";

const PublicRoutes = () => {
  const { authedUser } = useAuthentication();
  return authedUser ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoutes;
