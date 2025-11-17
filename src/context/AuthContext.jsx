// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "sonner";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/me");
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("token");
        toast.error("Session expired, please login again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loader while verifying token
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
