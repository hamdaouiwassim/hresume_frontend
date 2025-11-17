import axiosInstance from "../api/axiosInstance";

export const fetchRecruiterResumes = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axiosInstance.get(`/recruiter/resumes?${queryString}`);
};

export const fetchRecruiterResume = (id) => axiosInstance.get(`/recruiter/resumes/${id}`);

export const getTemplateProposals = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axiosInstance.get(`/recruiter/templates/proposals?${queryString}`);
};

export const createTemplateProposal = (data) =>
  axiosInstance.post("/recruiter/templates/proposals", data);

