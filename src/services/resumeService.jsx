import axiosInstance from "../api/axiosInstance";

// store resume
export const store = (data) => axiosInstance.post("/resumes", data);

// update resume
export const update = (id, data) => axiosInstance.put(`/resumes/${id}`, data);

// get resume by resume id
export const getByResumeId = (resumeId) => axiosInstance.get(`/resumes/${resumeId}`);

// get all resumes
export const getMyResumes = () => axiosInstance.get("/resumes");

// delete resume
export const remove = (id) => axiosInstance.delete(`/resumes/${id}`);

// save new resume (wrapper for store)
export const saveNewResume = async (data) =>  axiosInstance.post("/resumes",data);

// export other resume-related services as needed

// resume models, templates, etc. can also be managed here

export const getTemplates = () => axiosInstance.get("/templates");