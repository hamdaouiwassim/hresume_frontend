import axiosInstance from "../api/axiosInstance";

// store basic info
export const storeBasicInfo = (data) => axiosInstance.post("/basic-info", data);

// update basic info
export const updateBasicInfo = (id, data) => axiosInstance.put(`/basic-info/${id}`, data);

// get basic info by resume id
export const getBybasicInfoId = (resumeId) => axiosInstance.get(`/basic-info/${resumeId}`);

// delete basic info
export const removeBasicInfo = (id) => axiosInstance.delete(`/basic-info/${id}`);