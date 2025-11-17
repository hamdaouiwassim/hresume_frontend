import axiosInstance from "../api/axiosInstance";
import axios from 'axios';
import config from "../config";

export const generateShareableLink = (resumeId, expiresInDays = 7) => {
    return axiosInstance.post(`/resumes/${resumeId}/shareable-link/generate`, {
        expires_in_days: expiresInDays
    });
};

export const getCurrentShareableLink = (resumeId) => {
    return axiosInstance.get(`/resumes/${resumeId}/shareable-link`);
};

export const deactivateShareableLink = (resumeId) => {
    return axiosInstance.post(`/resumes/${resumeId}/shareable-link/deactivate`);
};

export const viewSharedResume = (token) => {
    // Create a new axios instance without auth for public access
    return axios.get(`${config.API_URL}share/${token}`, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        }
    });
};

