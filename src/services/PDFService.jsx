import axiosInstance from "../api/axiosInstance";

export const generatePDF = async (html, filename = "resume.pdf") => {
  return axiosInstance.post(
    "/generate-pdf",
    { html, filename },
    {
      responseType: "blob", // Important: get PDF as blob
    }
  );
};
