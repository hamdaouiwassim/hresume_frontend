import axiosInstance from "../api/axiosInstance";

// Register
export const register = (data) => axiosInstance.post("/register", data);

// Login
export const login = async (data) => {
   return axiosInstance.post("/login", data);
  
};

export const getGoogleAuthUrl = () => axiosInstance.get("/auth/google/url");

export const resendVerificationEmail = () =>
  axiosInstance.post("/email/verification-notification");

// Get current user
export const getMe = () => axiosInstance.get("/me");

// Logout
export const logout = async () => {
 return  axiosInstance.post("/logout");
 
  
};
