import axiosInstance from "../api/axiosInstance";

// Dashboard
export const getDashboardStats = () => axiosInstance.get("/admin/dashboard");

// Users
export const getAdminUsers = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/admin/users?${queryString}`);
};

export const getAdminUser = (id) => axiosInstance.get(`/admin/users/${id}`);
export const updateAdminUser = (id, data) => axiosInstance.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => axiosInstance.delete(`/admin/users/${id}`);

// Templates
export const getAdminTemplates = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/admin/templates?${queryString}`);
};

export const getAdminTemplate = (id) => axiosInstance.get(`/admin/templates/${id}`);
export const createAdminTemplate = (data) => axiosInstance.post("/admin/templates", data);
export const updateAdminTemplate = (id, data) => axiosInstance.put(`/admin/templates/${id}`, data);
export const deleteAdminTemplate = (id) => axiosInstance.delete(`/admin/templates/${id}`);

