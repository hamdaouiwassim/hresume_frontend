import { useState, useEffect, useCallback, useMemo } from "react";
import AuthLayout from "../Layouts/AuthLayout";
import {
  Camera,
  Save,
  UserCircle,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Heart,
  Download,
  Trophy,
  Loader2,
  Maximize2,
  X,
  Share2,
  Copy,
  Check,
  Link2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Eye,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { generatePDF } from "../services/PDFService";
import { useLanguage } from "../context/LanguageContext";
import { storeBasicInfo } from "../services/basicInfoService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { getByResumeId } from "../services/resumeService";
import { generateShareableLink, getCurrentShareableLink, deactivateShareableLink } from "../services/ShareableLinkService";
import ShowExperience from "../components/ShowExperience";
import NewExperience from "../components/NewExperience";
import ShowEducation from "../components/ShowEducation";
import NewEducation from "../components/NewEducation";
import ShowSkill from "../components/ShowSkill";
import NewSkill from "../components/NewSkill";
import ShowHobby from "../components/ShowHobby";
import NewHobby from "../components/NewHobby";
import ShowCertificate from "../components/ShowCertificate";
import NewCertificate from "../components/NewCertificate";
import { buildResumeTemplateData } from "../utils/resumeTemplateMapper";
import ResumeTemplatePreview from "../components/ResumeTemplatePreview";
export default function EditResume() {
    // 1. Destructure the 'id' parameter from the URL
  const { id } = useParams();

  const [showNewExperience,setShowNewExperience]=useState(false);
  const [showNewEducation,setShowNewEducation]=useState(false);
  const [showNewSkill,setShowNewSkill]=useState(false);
  const [showNewHobby,setShowNewHobby]=useState(false);
  const [showNewCertificate,setShowNewCertificate]=useState(false);
  const [isFullPagePreview, setIsFullPagePreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  
  // Prevent body scroll when full page preview is open
  useEffect(() => {
    if (isFullPagePreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullPagePreview]);
  
const fetchResumeData = useCallback(async () => {
 try {
        console.log("Resume ID from URL:", id);
        const response = await getByResumeId(id);
        const basicInfo = response.data.data.basic_info || {};
        const { full_name , job_title , phone, professional_summary , email , location, avatar, linkedin, github } = basicInfo;
        const { experiences } = response.data.data;
        const { educations } = response.data.data;
        const { skills } = response.data.data;
        const { hobbies } = response.data.data;
        const { certificates } = response.data.data;
         
        setFormData((prev) => ({
          ...prev,
          full_name,
          job_title,
          phone,
          professional_summary,
          email,
          location,
          linkedin: linkedin || "",
          github: github || "",
          avatar: avatar || prev.avatar,
          experiences: experiences || [],
          educations: educations || [],
          skills: skills || [],
          hobbies: hobbies || [],
          certificates: certificates || [],
        }));

      } catch (error) {
        console.error("Error fetching resume data:", error);
        }
}, [id]);
  useEffect(() => {
    // Fetch resume data using the 'id' and populate formData
   fetchResumeData();
    // Example: fetchResumeData(id);
  }, [fetchResumeData,showNewExperience,showNewEducation,showNewSkill,showNewHobby,showNewCertificate]);

  const { t, language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const localeCode = language === "fr" ? "fr" : "en";
  const shareStrings = t?.share || {};
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    job_title: "",
    resume_id: 1,
    linkedin: "",
    github: "",
    professional_summary: "",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    experiences: [],
    educations: [],
    skills: [],
    hobbies: [],
    certificates: [],
  });

  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isHobbiesOpen, setIsHobbiesOpen] = useState(false);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false);

  const hasBasicInfo = useMemo(() => {
    return [
      formData.full_name,
      formData.job_title,
      formData.email,
      formData.phone,
      formData.location,
      formData.professional_summary,
    ].every((value) => Boolean(value?.toString().trim()));
  }, [
    formData.full_name,
    formData.job_title,
    formData.email,
    formData.phone,
    formData.location,
    formData.professional_summary,
  ]);

  const downloadRequirementsMet = useMemo(() => {
    return (
      hasBasicInfo &&
      formData.experiences.length > 0 &&
      formData.educations.length > 0
    );
  }, [hasBasicInfo, formData.experiences.length, formData.educations.length]);

  const downloadRequirementMessage =
    "Complete your basic info and add at least one experience and one education before downloading.";

  const resumePreviewData = useMemo(
    () =>
      buildResumeTemplateData(formData, locale, {
        present: t?.preview?.present,
      }),
    [formData, locale, t?.preview?.present]
  );

  const openSection = (section) => {
    // Only open the section if it's not already open, and close all others
    if (section === "personal") {
      setIsPersonalInfoOpen(true);
    } else if (section === "experience") {
      setIsExperienceOpen(true);
    } else if (section === "education") {
      setIsEducationOpen(true);
    } else if (section === "skills") {
      setIsSkillsOpen(true);
    } else if (section === "hobbies") {
      setIsHobbiesOpen(true);
    } else if (section === "certificates") {
      setIsCertificatesOpen(true);
    }
    
    // Close all other sections
    if (section !== "personal") {
      setIsPersonalInfoOpen(false);
    }
    if (section !== "experience") {
      setIsExperienceOpen(false);
    }
    if (section !== "education") {
      setIsEducationOpen(false);
    }
    if (section !== "skills") {
      setIsSkillsOpen(false);
    }
    if (section !== "hobbies") {
      setIsHobbiesOpen(false);
    }
    if (section !== "certificates") {
      setIsCertificatesOpen(false);
    }
  };

  const toggleSection = (section) => {
    // Check if the clicked section is currently open
    let isCurrentlyOpen = false;
    if (section === "personal") {
      isCurrentlyOpen = isPersonalInfoOpen;
      setIsPersonalInfoOpen(prev => !prev);
    } else if (section === "experience") {
      isCurrentlyOpen = isExperienceOpen;
      setIsExperienceOpen(prev => !prev);
    } else if (section === "education") {
      isCurrentlyOpen = isEducationOpen;
      setIsEducationOpen(prev => !prev);
    } else if (section === "skills") {
      isCurrentlyOpen = isSkillsOpen;
      setIsSkillsOpen(prev => !prev);
    } else if (section === "hobbies") {
      isCurrentlyOpen = isHobbiesOpen;
      setIsHobbiesOpen(prev => !prev);
    } else if (section === "certificates") {
      isCurrentlyOpen = isCertificatesOpen;
      setIsCertificatesOpen(prev => !prev);
    }
    
    // Close all other sections only if we're opening a new one (not closing the current one)
    if (!isCurrentlyOpen) {
      if (section !== "personal") {
        setIsPersonalInfoOpen(false);
      }
      if (section !== "experience") {
        setIsExperienceOpen(false);
      }
      if (section !== "education") {
        setIsEducationOpen(false);
      }
      if (section !== "skills") {
        setIsSkillsOpen(false);
      }
      if (section !== "hobbies") {
        setIsHobbiesOpen(false);
      }
      if (section !== "certificates") {
        setIsCertificatesOpen(false);
      }
    }
  };

  // Load existing shareable link
  const loadShareableLink = async () => {
    setIsLoadingLink(true);
    try {
      const response = await getCurrentShareableLink(id);
      if (response.data.status && response.data.data) {
        setShareableLink(response.data.data);
      } else {
        setShareableLink(null);
      }
    } catch (error) {
      console.warn("No active shareable link", error);
      setShareableLink(null);
    } finally {
      setIsLoadingLink(false);
    }
  };

  // Generate new shareable link
  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await generateShareableLink(id, expiresInDays);
      if (response.data.status) {
        setShareableLink(response.data.data);
        toast.success(shareStrings.successGenerate || "Shareable link generated successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || shareStrings.generateError || "Failed to generate shareable link"
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Regenerate link
  const handleRegenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await generateShareableLink(id, expiresInDays);
      if (response.data.status) {
        setShareableLink(response.data.data);
        toast.success(shareStrings.successGenerate || "Shareable link generated successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || shareStrings.generateError || "Failed to generate shareable link"
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink.url);
      setLinkCopied(true);
      toast.success(shareStrings.copySuccess || "Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy share link", error);
      toast.error(shareStrings.copyError || "Failed to copy link");
    }
  };

  // Deactivate link
  const handleDeactivateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await deactivateShareableLink(id);
      if (response.data.status) {
        setShareableLink(null);
        toast.success(shareStrings.successDeactivate || "Shareable link deactivated");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || shareStrings.deactivateError || "Failed to deactivate link"
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadRequirementsMet) {
      toast.error(downloadRequirementMessage);
      return;
    }

    try {
      toast.loading("Generating PDF...", { id: "pdf-generation" });

      const filename = `${
        formData.full_name ? formData.full_name.replace(/\s+/g, "_") : "cv"
      }.pdf`;
      const resumePayload = buildResumeTemplateData(formData, locale, {
        present: t?.preview?.present,
      });

      const response = await generatePDF({
        resume: resumePayload,
        filename,
        locale: localeCode,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(
        error.response?.data?.message ||
          "There was an error generating the PDF. Please try again.",
        { id: "pdf-generation" }
      );
    }
  };
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.full_name || formData.full_name.trim() === '') {
      newErrors.full_name = ['Full name is required'];
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Email is invalid'];
    }
    return newErrors;
  };

  const hasValidationErrors = () => {
    const validationErrors = validateBasicInfo();
    return Object.keys(validationErrors).length > 0 || Object.keys(errors).length > 0;
  };
  
  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateBasicInfo();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
     
      
      const response = await storeBasicInfo({
        resume_id: id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        job_title: formData.job_title,
        professional_summary: formData.professional_summary,
      });   
      toast.success(response.data.message || "Basic info saved successfully!");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        console.log(error.response.data.errors);
        setErrors(error.response.data.errors);
      }
      toast.error("Error saving basic info. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers to keep accordions open and refetch data after save
  const handleExperienceSave = () => {
    setIsExperienceOpen(true);
    setShowNewExperience(false);
    fetchResumeData();
  };

  const handleEducationSave = () => {
    setIsEducationOpen(true);
    setShowNewEducation(false);
    fetchResumeData();
  };

  const handleSkillSave = () => {
    setIsSkillsOpen(true);
    setShowNewSkill(false);
    fetchResumeData();
  };

  const handleHobbySave = () => {
    setIsHobbiesOpen(true);
    setShowNewHobby(false);
    fetchResumeData();
  };

  const handleCertificateSave = () => {
    setIsCertificatesOpen(true);
    setShowNewCertificate(false);
    fetchResumeData();
  };

  // Experience handlers
  const addExperience = () => {
    setShowNewExperience(true);
    openSection("experience");
  };

  // Education handlers
  const addEducation = () => {
     setShowNewEducation(true);
    openSection("education");
  };

  // Skills handlers
  const addSkill = () => {
    setShowNewSkill(true);
    openSection("skills");
  };

  // Hobbies handlers
  const addHobby = () => {
    setShowNewHobby(true);
    openSection("hobbies");
  };

  // Certificates handlers
  const addCertificate = () => {
    setShowNewCertificate(true);
    openSection("certificates");
  };

  

 


 

  const accordionThemes = {
    personal: {
      openContainer:
        "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-white shadow-lg shadow-blue-100",
      iconOpen: "bg-blue-600 text-white shadow-blue-200",
      chevron: "text-blue-600",
    },
    experience: {
      openContainer:
        "border-amber-500 bg-gradient-to-br from-amber-50 via-white to-white shadow-lg shadow-amber-100",
      iconOpen: "bg-amber-500 text-white shadow-amber-200",
      chevron: "text-amber-600",
    },
    education: {
      openContainer:
        "border-purple-500 bg-gradient-to-br from-purple-50 via-white to-white shadow-lg shadow-purple-100",
      iconOpen: "bg-purple-600 text-white shadow-purple-200",
      chevron: "text-purple-600",
    },
    skills: {
      openContainer:
        "border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-white shadow-lg shadow-emerald-100",
      iconOpen: "bg-emerald-500 text-white shadow-emerald-200",
      chevron: "text-emerald-600",
    },
    hobbies: {
      openContainer:
        "border-pink-500 bg-gradient-to-br from-pink-50 via-white to-white shadow-lg shadow-pink-100",
      iconOpen: "bg-pink-500 text-white shadow-pink-200",
      chevron: "text-pink-600",
    },
    certificates: {
      openContainer:
        "border-indigo-500 bg-gradient-to-br from-indigo-50 via-white to-white shadow-lg shadow-indigo-100",
      iconOpen: "bg-indigo-500 text-white shadow-indigo-200",
      chevron: "text-indigo-600",
    },
  };

  const sectionLabels = {
    personal: t.preview?.sectionLabelPersonal || "01 Personal Info",
    experience: t.preview?.sectionLabelExperience || "02 Experience",
    education: t.preview?.sectionLabelEducation || "03 Education",
    skills: t.preview?.sectionLabelSkills || "04 Skills",
    hobbies: t.preview?.sectionLabelHobbies || "05 Hobbies",
    certificates: t.preview?.sectionLabelCertificates || "06 Certificates",
  };

  const getAccordionClasses = (key, isOpen) =>
    `mb-5 rounded-2xl border transition-all duration-300 ${
      isOpen
        ? accordionThemes[key].openContainer
        : "border-slate-200 bg-white hover:border-slate-300"
    }`;

  const getAccordionButtonClasses = (isOpen) =>
    `w-full flex items-center justify-between px-7 py-5 text-left transition-colors duration-300 ${
      isOpen ? "text-slate-900" : "text-slate-600"
    }`;

  const getAccordionIconClasses = (key, isOpen) =>
    `h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
      isOpen ? accordionThemes[key].iconOpen : "bg-slate-100 text-slate-500"
    }`;

  const getChevronClasses = (key, isOpen) =>
    `h-5 w-5 transition-transform duration-300 ${
      isOpen ? `rotate-180 ${accordionThemes[key].chevron}` : "text-slate-400"
    }`;

  const buttonBase =
    "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const buttonVariants = {
    primary: `${buttonBase} px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 focus:ring-offset-white`,
    secondary: `${buttonBase} px-4 py-2.5 bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-white focus:ring-slate-400 focus:ring-offset-white`,
    outline: `${buttonBase} px-4 py-2.5 border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 focus:ring-slate-400 focus:ring-offset-white`,
    muted: `${buttonBase} px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 focus:ring-offset-white`,
    purple: `${buttonBase} px-4 py-2.5 border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 focus:ring-purple-300 focus:ring-offset-white`,
    blueSolid: `${buttonBase} px-4 py-2.5 bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white`,
    danger: `${buttonBase} px-4 py-2.5 border border-red-200 text-red-600 bg-white hover:border-red-300 focus:ring-red-400 focus:ring-offset-white`,
  };
  const disabledButtonClasses = "opacity-50 cursor-not-allowed pointer-events-none";

 

  return (
    <AuthLayout>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel - CV Form */}
          <div className="p-3 bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl rounded-3xl overflow-hidden self-start">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className={getAccordionClasses("personal", isPersonalInfoOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("personal")}
                  className={getAccordionButtonClasses(isPersonalInfoOpen)}
                  aria-expanded={isPersonalInfoOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("personal", isPersonalInfoOpen)}>
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.personal}
                      </p>
                      <h2 className="text-lg font-semibold">{t.personal.title}</h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("personal", isPersonalInfoOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isPersonalInfoOpen ? "max-h-[4000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isPersonalInfoOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <div className="flex justify-center pb-6">
                      <div className="relative">
                        <img
                          src={formData.avatar}
                          alt="Profile"
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                        >
                          <Camera className="h-5 w-5" />
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.fullName}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.fullNameHint})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5"
                            placeholder={t.dashboard.sections.personalInfo.fullNamePlaceholder}
                          />
                        </div>
                        {errors.full_name && (
                          <p className="mt-2 text-sm text-red-600" id="name-error">
                            {errors.full_name[0]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.jobTitle}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.jobTitleHint})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5"
                            placeholder={t.dashboard.sections.personalInfo.jobTitlePlaceholder}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.email}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.emailHint})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5"
                            placeholder={t.dashboard.sections.personalInfo.emailPlaceholder}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.phone}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.phoneHint})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5"
                            placeholder={t.dashboard.sections.personalInfo.phonePlaceholder}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.location}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.locationHint})
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5"
                            placeholder={t.dashboard.sections.personalInfo.locationPlaceholder}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.personalInfo.summary}{" "}
                          <span className="text-gray-400">
                            ({t.dashboard.sections.personalInfo.summaryHint})
                          </span>
                        </label>
                        <textarea
                          name="professional_summary"
                          rows={4}
                          value={formData.professional_summary}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-4"
                          placeholder={t.dashboard.sections.personalInfo.summaryPlaceholder}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={hasValidationErrors() || isLoading}
                        className={`${buttonVariants.primary} ${
                          hasValidationErrors() || isLoading ? disabledButtonClasses : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t.common.loading}</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>{t.common.save}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className={getAccordionClasses("experience", isExperienceOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("experience")}
                  className={getAccordionButtonClasses(isExperienceOpen)}
                  aria-expanded={isExperienceOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("experience", isExperienceOpen)}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.experience}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.experiences.title}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("experience", isExperienceOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isExperienceOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isExperienceOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addExperience}
                      className={`mt-2 mb-4 ${buttonBase} border border-amber-200 bg-amber-50/80 text-amber-700 px-4 py-2 text-sm hover:bg-amber-100 focus:ring-amber-400 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.experiences.addExperience}
                    </button>

                    {showNewExperience && (
                      <NewExperience
                        index={formData.experiences.length}
                        hide={() => setShowNewExperience(false)}
                        resumeId={id}
                        onSave={handleExperienceSave}
                      />
                    )}

                    {formData.experiences.map((exp, index) => (
                      <ShowExperience
                        key={exp.id || index}
                        exp={exp}
                        index={index}
                        hide={() => setShowNewExperience(false)}
                        resumeId={id}
                        onSave={handleExperienceSave}
                        onDelete={handleExperienceSave}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className={getAccordionClasses("education", isEducationOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("education")}
                  className={getAccordionButtonClasses(isEducationOpen)}
                  aria-expanded={isEducationOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("education", isEducationOpen)}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.education}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.educations.title}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("education", isEducationOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isEducationOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isEducationOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addEducation}
                      className={`mt-2 mb-4 ${buttonBase} border border-purple-200 bg-purple-50/80 text-purple-700 px-4 py-2 text-sm hover:bg-purple-100 focus:ring-purple-300 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.educations.addEducation}
                    </button>

                    {showNewEducation && (
                      <NewEducation
                        index={formData.educations ? formData.educations.length : 0}
                        hide={() => setShowNewEducation(false)}
                        resumeId={id}
                        onSave={handleEducationSave}
                      />
                    )}

                    {formData.educations.map((exp, index) => (
                      <ShowEducation
                        key={exp.id || index}
                        exp={exp}
                        index={index}
                        hide={() => setShowNewEducation(false)}
                        resumeId={id}
                        onSave={handleEducationSave}
                        onDelete={handleEducationSave}
                      />
                    ))}
                  </div>
                </div>
              </div>

            

              {/* Skills Section */}
              <div className={getAccordionClasses("skills", isSkillsOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("skills")}
                  className={getAccordionButtonClasses(isSkillsOpen)}
                  aria-expanded={isSkillsOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("skills", isSkillsOpen)}>
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.skills}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.skills.title}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("skills", isSkillsOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isSkillsOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isSkillsOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addSkill}
                      className={`mt-2 mb-4 ${buttonBase} border border-emerald-200 bg-emerald-50/80 text-emerald-700 px-4 py-2 text-sm hover:bg-emerald-100 focus:ring-emerald-400 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.skills.addSkill}
                    </button>

                    {showNewSkill && (
                      <NewSkill
                        index={formData.skills ? formData.skills.length : 0}
                        hide={() => setShowNewSkill(false)}
                        resumeId={id}
                        onSave={handleSkillSave}
                      />
                    )}

                    {formData.skills &&
                      formData.skills.map((skill, index) => (
                        <ShowSkill
                          key={skill.id || index}
                          skill={skill}
                          index={index}
                          hide={() => setShowNewSkill(false)}
                          resumeId={id}
                          onSave={handleSkillSave}
                          onDelete={handleSkillSave}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* Hobbies Section */}
              <div className={getAccordionClasses("hobbies", isHobbiesOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("hobbies")}
                  className={getAccordionButtonClasses(isHobbiesOpen)}
                  aria-expanded={isHobbiesOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("hobbies", isHobbiesOpen)}>
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.hobbies}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.hobbies.title || "Hobbies & Interests"}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("hobbies", isHobbiesOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isHobbiesOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isHobbiesOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addHobby}
                      className={`mt-2 mb-4 ${buttonBase} border border-pink-200 bg-pink-50/80 text-pink-600 px-4 py-2 text-sm hover:bg-pink-100 focus:ring-pink-300 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.hobbies.addHobby ||
                        t.hobbies.addButton ||
                        "Add Hobby"}
                    </button>

                    {showNewHobby && (
                      <NewHobby
                        index={formData.hobbies ? formData.hobbies.length : 0}
                        hide={() => setShowNewHobby(false)}
                        resumeId={id}
                        onSave={handleHobbySave}
                      />
                    )}

                    {formData.hobbies &&
                      formData.hobbies.map((hobby, index) => (
                        <ShowHobby
                          key={hobby.id || index}
                          hobby={hobby}
                          index={index}
                          hide={() => setShowNewHobby(false)}
                          resumeId={id}
                          onSave={handleHobbySave}
                          onDelete={handleHobbySave}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div className={getAccordionClasses("certificates", isCertificatesOpen)}>
                <button
                  type="button"
                  onClick={() => toggleSection("certificates")}
                  className={getAccordionButtonClasses(isCertificatesOpen)}
                  aria-expanded={isCertificatesOpen}
                >
                  <div className="flex items-center gap-3">
                    <div className={getAccordionIconClasses("certificates", isCertificatesOpen)}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.certificates}
                      </p>
                      <h2 className="text-lg font-semibold">{t.certificates.title}</h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("certificates", isCertificatesOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isCertificatesOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isCertificatesOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addCertificate}
                      className={`mt-2 mb-4 ${buttonBase} border border-indigo-200 bg-indigo-50/80 text-indigo-700 px-4 py-2 text-sm hover:bg-indigo-100 focus:ring-indigo-300 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.certificates.addCertificate ||
                        t.certificates.add ||
                        "Add Certificate"}
                    </button>

                    {showNewCertificate && (
                      <NewCertificate
                        index={formData.certificates ? formData.certificates.length : 0}
                        hide={() => setShowNewCertificate(false)}
                        resumeId={id}
                        onSave={handleCertificateSave}
                      />
                    )}

                    {formData.certificates &&
                      formData.certificates.map((certificate, index) => (
                        <ShowCertificate
                          key={certificate.id || index}
                          certificate={certificate}
                          index={index}
                          hide={() => setShowNewCertificate(false)}
                          resumeId={id}
                          onSave={handleCertificateSave}
                          onDelete={handleCertificateSave}
                        />
                      ))}
                  </div>
                </div>
              </div>

              
            </form>
          </div>

          {/* Right Panel - CV Preview */}
          <div className="w-full xl:sticky top-8 space-y-6 self-start">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFullPagePreview(true)}
                    className={buttonVariants.outline}
                    title="Full page preview"
                  >
                    <Maximize2 className="h-4 w-4" />
                    {t.nav.fullPage}
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      loadShareableLink();
                    }}
                    className={buttonVariants.purple}
                    title={shareStrings.buttonTitle || "Share CV"}
                  >
                    <Share2 className="h-4 w-4" />
                    {shareStrings.button || "Share"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!downloadRequirementsMet}
                    title={
                      downloadRequirementsMet ? undefined : downloadRequirementMessage
                    }
                    className={`${buttonVariants.blueSolid} ${
                      !downloadRequirementsMet ? disabledButtonClasses : ""
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    {t.nav.download}
                  </button>
                </div>
              </div>
            <ResumeTemplatePreview resume={resumePreviewData} />

            {false && (
            <div className="bg-white rounded-lg p-8 print:bg-white" data-cv-preview="true">
                {/* Header Section */}
                <div className="mb-8 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formData.full_name || t.preview.yourName}
                  </h1>
                      <p className="text-lg text-gray-600 mb-4">
                    {formData.job_title || t.preview.professionalTitle}
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
                        style={{ border: '2px solid #e5e7eb' }}
                      />
                    )}
                  </div>
                </div>

                {/* Professional Summary Section */}
                {formData.professional_summary && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      {t.preview.professionalSummary}
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {formData.professional_summary}
                    </p>
                  </div>
                )}

                

                {/* Work Experience Section */}
                {formData.experiences.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {t.preview.workExperience}
                    </h2>
                    <div className="space-y-6">
                      {formData.experiences.map((exp, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                              {exp.position}
                            </h3>
                              <p className="text-gray-600 font-medium">{exp.company}</p>
                          </div>
                            <p className="text-gray-500 text-sm whitespace-nowrap">
                            {exp.startDate &&
                              new Date(exp.startDate).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                  { month: "short", year: "numeric" }
                              )}
                            {exp.startDate && exp.endDate && " - "}
                              {exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                    { month: "short", year: "numeric" }
                                  )
                                : exp.startDate && t.preview.present}
                          </p>
                          </div>
                          {exp.description && (
                            <div className="text-gray-700 text-sm leading-relaxed pl-4 border-l-2 border-gray-200">
                              {exp.description.split("\n").map((item, i) => (
                                item.trim() && (
                                  <div key={i} className="mb-1">
                                    • {item.trim()}
                                </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {formData.educations.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {t.preview.education}
                    </h2>
                    <div className="space-y-5">
                      {formData.educations.map((edu, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {edu.degree}
                            </h3>
                              <p className="text-gray-600">{edu.institution}</p>
                          </div>
                            <p className="text-gray-500 text-sm whitespace-nowrap">
                            {edu.start_date &&
                              new Date(edu.start_date).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                  { month: "short", year: "numeric" }
                              )}
                            {edu.start_date && edu.end_date && " - "}
                              {edu.end_date
                                ? new Date(edu.end_date).toLocaleDateString(
                                language === "fr" ? "fr-FR" : "en-US",
                                    { month: "short", year: "numeric" }
                                  )
                                : edu.start_date && t.preview.present}
                          </p>
                          </div>
                          {edu.description && (
                            <p className="text-gray-700 text-sm leading-relaxed mt-2">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {formData.skills.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {t.preview.skills}
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
                            <span className="text-gray-500 ml-1" style={{ color: '#6b7280' }}>
                              ({skill.proficiency})
                            </span>
                          )}
                              </span>
                            ))}
                    </div>
                  </div>
                )}

                {/* Hobbies Section */}
                {formData.hobbies.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {t.preview.interests}
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

                {/* Certificates Section */}
                {formData.certificates.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {t.preview.certifications}
                    </h2>
                    <div className="space-y-4">
                      {formData.certificates.map((cert, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                              {cert.name}
                            </h3>
                              {cert.issuer && (
                                <p className="text-gray-600 text-sm">{cert.issuer}</p>
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
            </div>
          </div>

         
        </div>
      </div>
      </div>

      {/* Full Page Preview Modal */}
      {isFullPagePreview && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75"
          onClick={() => setIsFullPagePreview(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {t.nav.preview} - {t.preview.fullPageView}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownload}
                    disabled={!downloadRequirementsMet}
                    title={
                      downloadRequirementsMet ? undefined : downloadRequirementMessage
                    }
                    className={`${buttonVariants.blueSolid} ${
                      !downloadRequirementsMet ? disabledButtonClasses : ""
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    {t.nav.download}
                  </button>
                  <button
                    onClick={() => setIsFullPagePreview(false)}
                    className={`${buttonBase} p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 focus:ring-slate-300 focus:ring-offset-white`}
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Full Page Preview Content */}
              <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div
                  className="bg-white rounded-lg mx-auto"
                  style={{ width: '210mm', minHeight: '297mm' }}
                >
                  <ResumeTemplatePreview resume={resumePreviewData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75"
          onClick={() => setShowShareModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Share2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {shareStrings.modalTitle || "Share Your CV"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  title={shareStrings.close || "Close"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isLoadingLink ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : !shareableLink ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      {shareStrings.description ||
                        "Generate a secure temporary link to share your CV with others. The link will expire after the selected number of days."}
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {shareStrings.expiresLabel || "Link expires in (days)"}
                      </label>
                      <select
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value={1}>{shareStrings.days?.["1"] || "1 day"}</option>
                          <option value={7}>{shareStrings.days?.["7"] || "7 days"}</option>
                          <option value={30}>{shareStrings.days?.["30"] || "30 days"}</option>
                          <option value={90}>{shareStrings.days?.["90"] || "90 days"}</option>
                          <option value={365}>{shareStrings.days?.["365"] || "1 year"}</option>
                        </select>
                    </div>
                    <button
                      onClick={handleGenerateLink}
                      disabled={isGeneratingLink}
                      className={`${buttonVariants.primary} w-full justify-center ${
                        isGeneratingLink ? disabledButtonClasses : ""
                      }`}
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {shareStrings.generating || "Generating..."}
                        </>
                      ) : (
                        <>
                          <Link2 className="h-5 w-5" />
                          {shareStrings.generate || "Generate Shareable Link"}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">
                          {shareStrings.shareableLink || "Shareable Link"}
                        </span>
                        <span className="text-xs text-purple-600">
                          {(shareStrings.expires || "Expires") + ": "}
                          {new Date(shareableLink.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={shareableLink.url}
                          className="flex-1 px-3 py-2 text-sm bg-white border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={handleCopyLink}
                          className={`${buttonBase} px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-400 focus:ring-offset-white`}
                          title={shareStrings.copy || "Copy link"}
                        >
                          {linkCopied ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span className="sr-only">{shareStrings.copied || "Copied!"}</span>
                            </>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(shareableLink.url, '_blank')}
                        className={`${buttonVariants.purple} flex-1 justify-center`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {shareStrings.open || "Open Link"}
                      </button>
                      <button
                        onClick={handleDeactivateLink}
                        disabled={isGeneratingLink}
                        className={`${buttonVariants.danger} flex-1 justify-center ${
                          isGeneratingLink ? disabledButtonClasses : ""
                        }`}
                      >
                        {isGeneratingLink ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {shareStrings.deactivating || "Deactivating..."}
                          </>
                        ) : (
                          shareStrings.deactivate || "Deactivate Link"
                        )}
                      </button>
                    </div>
                    {!shareableLink ? null : (
                      <button
                        onClick={handleRegenerateLink}
                        disabled={isGeneratingLink}
                        className={`${buttonVariants.outline} w-full justify-center mt-3 ${
                          isGeneratingLink ? disabledButtonClasses : ""
                        }`}
                      >
                        {shareStrings.newLink || "Generate New Link"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
