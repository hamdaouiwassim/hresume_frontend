import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RecruiterRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_recruiter || user.recruiter_status !== "approved") {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RecruiterRoute;

