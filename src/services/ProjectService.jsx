import axiosInstance from "../api/axiosInstance";

// store project
export const storeProject = (data) => axiosInstance.post("/projects", data);

// update project
export const updateProject = (data, id) => axiosInstance.put("/projects/" + id, data);

// delete project
export const deleteProject = (id) => axiosInstance.delete("/projects/" + id);

