import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, Loader2, Download, ArrowLeft } from "lucide-react";
import { viewSharedResume } from "../services/ShareableLinkService";
import { generatePDF } from "../services/PDFService";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";

export default function SharedResumeView() {
  const { token } = useParams();
  const { language } = useLanguage();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cvPreviewRef = useRef(null);

  useEffect(() => {
    fetchSharedResume();
  }, [token]);

  const fetchSharedResume = async () => {
    try {
      setLoading(true);
      const response = await viewSharedResume(token);
      if (response.data.status) {
        setResume(response.data.data);
      } else {
        setError(response.data.message || "Failed to load resume");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Link not found or expired");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const content = cvPreviewRef.current;
    if (!content) return;

    try {
      toast.loading("Generating PDF...", { id: "pdf-generation" });

      // Wait for images to load
      const images = content.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(() => resolve(), 5000);
              }
            })
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      const clonedContent = content.cloneNode(true);

      // Apply styles for PDF
      const skillBadges = clonedContent.querySelectorAll('.bg-gray-100');
      skillBadges.forEach(badge => {
        badge.style.backgroundColor = '#f3f4f6';
        badge.style.color = '#1f2937';
        badge.style.paddingTop = '4px';
        badge.style.paddingBottom = '4px';
        badge.style.paddingLeft = '12px';
        badge.style.paddingRight = '12px';
      });

      // Remove image borders
      const imageElements = clonedContent.querySelectorAll('img');
      imageElements.forEach(img => {
        img.style.border = 'none';
        img.style.borderWidth = '0';
        img.style.borderColor = 'transparent';
        img.style.boxShadow = 'none';
        img.style.backgroundColor = 'transparent';
      });

      const style = document.createElement('style');
      style.textContent = `
        [data-cv-preview="true"] {
          padding: 32px !important;
          box-sizing: border-box;
        }
        .bg-gray-100 {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        p { orphans: 2; widows: 2; page-break-inside: avoid; }
        h1, h2, h3 { page-break-after: avoid; }
        img {
          page-break-inside: avoid;
          border: none !important;
          box-shadow: none !important;
          background-color: transparent !important;
        }
      `;

      const htmlString = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${style.textContent}
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0;">
            ${clonedContent.outerHTML}
          </body>
        </html>
      `;

      const filename = `${resume.name || "cv"}.pdf`;
      const response = await generatePDF(htmlString, filename);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: "pdf-generation" });
    }
  };

  const formatResumeData = (resume) => {
    if (!resume) return {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      job_title: "",
      professional_summary: "",
      avatar: "",
      experiences: [],
      educations: [],
      skills: [],
      hobbies: [],
      certificates: [],
    };
    
    const basicInfo = resume.basic_info || {};
    return {
      full_name: basicInfo.full_name || "",
      email: basicInfo.email || "",
      phone: basicInfo.phone || "",
      location: basicInfo.location || "",
      job_title: basicInfo.job_title || "",
      professional_summary: basicInfo.professional_summary || "",
      avatar: basicInfo.avatar || "",
      experiences: resume.experiences || [],
      educations: resume.educations || [],
      skills: resume.skills || [],
      hobbies: resume.hobbies || [],
      certificates: resume.certificates || [],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const formData = formatResumeData(resume);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{resume.name}</h1>
              <p className="text-sm text-gray-500">Shared Resume</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        </div>

        {/* CV Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div
            ref={cvPreviewRef}
            className="bg-white rounded-lg p-8 print:bg-white"
            data-cv-preview="true"
          >
            {/* Header Section */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formData.full_name || "Your Name"}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {formData.job_title || "Professional Title"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {formData.email && (
                      <span className="flex items-center">
                        <span className="mr-1">📧</span>
                        {formData.email}
                      </span>
                    )}
                    {formData.phone && (
                      <span className="flex items-center">
                        <span className="mr-1">📱</span>
                        {formData.phone}
                      </span>
                    )}
                    {formData.location && (
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        {formData.location}
                      </span>
                    )}
                  </div>
                </div>
                {formData.avatar && (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="h-28 w-28 rounded-full object-cover border-2 border-gray-200 shadow-lg flex-shrink-0"
                  />
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {formData.professional_summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formData.professional_summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {formData.experiences && formData.experiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {formData.experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-300 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-base text-gray-700 font-medium">{exp.company}</p>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {exp.startDate && new Date(exp.startDate).toLocaleDateString(
                            language === "fr" ? "fr-FR" : "en-US",
                            { month: "short", year: "numeric" }
                          )}
                          {exp.startDate && exp.endDate && " - "}
                          {exp.endDate
                            ? new Date(exp.endDate).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                { month: "short", year: "numeric" }
                              )
                            : exp.startDate && "Present"}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {formData.educations && formData.educations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Education
                </h2>
                <div className="space-y-6">
                  {formData.educations.map((edu, index) => (
                    <div key={index} className="border-l-2 border-gray-300 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-base text-gray-700 font-medium">{edu.institution}</p>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {edu.start_date && new Date(edu.start_date).toLocaleDateString(
                            language === "fr" ? "fr-FR" : "en-US",
                            { month: "short", year: "numeric" }
                          )}
                          {edu.start_date && edu.end_date && " - "}
                          {edu.end_date
                            ? new Date(edu.end_date).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                { month: "short", year: "numeric" }
                              )
                            : edu.start_date && "Present"}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {formData.skills && formData.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium"
                      style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}
                    >
                      {skill.name}
                      {skill.proficiency && (
                        <span className="ml-1" style={{ color: '#6b7280' }}>
                          ({skill.proficiency})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {formData.hobbies && formData.hobbies.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium"
                      style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}
                    >
                      {hobby.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {formData.certificates && formData.certificates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Certifications
                </h2>
                <div className="space-y-4">
                  {formData.certificates.map((cert, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{cert.name}</h3>
                        {cert.issuer && (
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        )}
                      </div>
                      {cert.date_obtained && (
                        <p className="text-gray-500 text-sm whitespace-nowrap">
                          {new Date(cert.date_obtained).toLocaleDateString(
                            language === "fr" ? "fr-FR" : "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

