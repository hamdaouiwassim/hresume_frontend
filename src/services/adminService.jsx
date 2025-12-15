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
export const sendAdminUserMessage = (userId, data) => axiosInstance.post(`/admin/users/${userId}/message`, data);

// Templates
export const getAdminTemplates = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/admin/templates?${queryString}`);
};

export const getAdminTemplate = (id) => axiosInstance.get(`/admin/templates/${id}`);
export const createAdminTemplate = (formData) =>
    axiosInstance.post("/admin/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const updateAdminTemplate = (id, formData) =>
    axiosInstance.post(`/admin/templates/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const deleteAdminTemplate = (id) => axiosInstance.delete(`/admin/templates/${id}`);

// Resumes
export const getAdminResumes = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/admin/resumes?${queryString}`);
};

export const getAdminResume = (id) => axiosInstance.get(`/admin/resumes/${id}`);

