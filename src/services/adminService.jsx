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

// PDF Fonts
export const getAdminFonts = () => axiosInstance.get("/admin/fonts");
export const uploadAdminFont = (formData) =>
    axiosInstance.post("/admin/fonts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const toggleAdminFont = (id) => axiosInstance.post(`/admin/fonts/${id}/toggle`);
export const deleteAdminFont = (id) => axiosInstance.delete(`/admin/fonts/${id}`);

// Active PDF fonts (for user font dropdown)
export const getActivePdfFonts = () => axiosInstance.get("/pdf-fonts/active");

// Cover Letter Templates
export const getAdminCoverLetterTemplates = (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/admin/cover-letter-templates?${queryString}`);
};

export const createAdminCoverLetterTemplate = (data) => axiosInstance.post("/admin/cover-letter-templates", data);
export const updateAdminCoverLetterTemplate = (id, data) => axiosInstance.put(`/admin/cover-letter-templates/${id}`, data);
export const deleteAdminCoverLetterTemplate = (id) => axiosInstance.delete(`/admin/cover-letter-templates/${id}`);

