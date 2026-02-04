import axiosInstance from "../api/axiosInstance";

// Get all available templates
export const getTemplates = () => {
  return axiosInstance.get("/templates");
};