import axiosInstance from "../api/axiosInstance";

export const generatePDF = async ({
  resume,
  html,
  filename = "resume.pdf",
  locale = "en",
}) => {
  return axiosInstance.post(
    "/generate-pdf",
    { resume, html, filename, locale },
    {
      responseType: "blob",
    }
  );
};
