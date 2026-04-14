import { useState, useEffect, useCallback, useMemo, useContext } from "react";
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
  Globe,
  UserPlus,
  Mail,
  Trash2,
  FolderGit,
  GripVertical,
  Settings,
} from "lucide-react";
import { generatePDF } from "../services/PDFService";
import { useLanguage } from "../context/LanguageContext";
import { storeBasicInfo, uploadResumeAvatar } from "../services/basicInfoService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { getByResumeId, update as updateResume, getTemplates } from "../services/resumeService";
import { getActivePdfFonts } from "../services/adminService";
import { generateShareableLink, getCurrentShareableLink, deactivateShareableLink } from "../services/ShareableLinkService";
import { inviteCollaborator, getCollaborators, removeCollaborator } from "../services/CollaborationService";
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
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import ShowLanguage from "../components/ShowLanguage";
import NewLanguage from "../components/NewLanguage";
import ShowProject from "../components/ShowProject";
import NewProject from "../components/NewProject";
import { buildResumeTemplateData } from "../utils/resumeTemplateMapper";
import ResumeTemplatePreview from "../components/ResumeTemplatePreview";
import { deriveTemplateLayout, TEMPLATE_LAYOUTS } from "../utils/templateStyles";
import SectionOrderManager from "../components/SectionOrderManager";

const createPreviewDraftsState = () => ({
  experiences: { edits: {}, draft: null },
  educations: { edits: {}, draft: null },
  skills: { edits: {}, draft: null },
  hobbies: { edits: {}, draft: null },
  certificates: { edits: {}, draft: null },
  languages: { edits: {}, draft: null },
  projects: { edits: {}, draft: null },
});

// Toolbar button: icon only by default, label revealed on hover (sm and up). Uses max-width so transition animates.
const toolbarLabelClass =
  "hidden sm:inline-block overflow-hidden whitespace-nowrap max-w-0 ml-0 transition-[max-width,margin] duration-200 ease-out group-hover:max-w-[8rem] group-hover:ml-1.5";
export default function EditResume() {
    // 1. Destructure the 'id' parameter from the URL
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [showNewExperience,setShowNewExperience]=useState(false);
  const [showNewEducation,setShowNewEducation]=useState(false);
  const [showNewSkill,setShowNewSkill]=useState(false);
  const [showNewHobby,setShowNewHobby]=useState(false);
  const [showNewCertificate,setShowNewCertificate]=useState(false);
  const [showNewLanguage,setShowNewLanguage]=useState(false);
  const [showNewProject,setShowNewProject]=useState(false);
  const [isFullPagePreview, setIsFullPagePreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isChangingTemplate, setIsChangingTemplate] = useState(false);
  const [showCustomisePdfModal, setShowCustomisePdfModal] = useState(false);
  const [typography, setTypography] = useState({ font_family: "sans-serif", font_size: 14, font_id: null });
  const [isSavingTypography, setIsSavingTypography] = useState(false);

  // Built-in fonts that Dompdf always supports
  const builtInFontOptions = [
    { value: "sans-serif", label: "Helvetica (Sans-Serif)" },
    { value: "serif", label: "Times (Serif)" },
    { value: "monospace", label: "Courier (Monospace)" },
    { value: "dejavu sans", label: "DejaVu Sans" },
    { value: "dejavu serif", label: "DejaVu Serif" },
    { value: "dejavu sans mono", label: "DejaVu Sans Mono" },
  ];
  const [customFontOptions, setCustomFontOptions] = useState([]);
  const pdfFontOptions = [...builtInFontOptions, ...customFontOptions];
  const [selectedSections, setSelectedSections] = useState([
    'basic_info',
    'experiences',
    'educations',
    'skills',
    'hobbies',
    'certificates',
    'languages',
    'projects'
  ]); // Default: all sections allowed
  const [userPermissions, setUserPermissions] = useState(null); // null = owner (all permissions), array = allowed sections
  
  // Fixed sections that cannot be reordered
  const fixedSections = ['personal', 'socialMedia'];

  // Default section order (matching section keys used in the form)
  const defaultSectionOrder = ['personal', 'socialMedia', 'experience', 'education', 'skills', 'hobbies', 'certificates', 'languages', 'projects'];

  // Helper function to ensure fixed sections are always at the beginning
  const ensureFixedSectionsFirst = (orderArray) => {
    // Start with fixed sections
    const result = [...fixedSections];

    // Add remaining sections in the order they appear in the input array
    orderArray.forEach(section => {
      if (!fixedSections.includes(section)) {
        result.push(section);
      }
    });

    // Ensure all default sections are included
    defaultSectionOrder.forEach(section => {
      if (!result.includes(section)) {
        result.push(section);
      }
    });

    return result;
  };

  // Wrapper function for section order changes to ensure fixed sections stay first
  const handleSectionOrderChange = (newOrder) => {
    setSectionOrder(ensureFixedSectionsFirst(newOrder));
  };
  const [sectionOrder, setSectionOrder] = useState(ensureFixedSectionsFirst(defaultSectionOrder));
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState(null);


  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    job_title: "",
    resume_id: 1,
    template_id: null,
    template_layout: TEMPLATE_LAYOUTS.CLASSIC,
    linkedin: "",
    github: "",
    website: "",
    professional_summary: "",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    show_photo_on_cv: true,
    experiences: [],
    educations: [],
    skills: [],
    hobbies: [],
    certificates: [],
    languages: [],
    projects: [],
  });
  const [previewDrafts, setPreviewDrafts] = useState(() => createPreviewDraftsState());

  const resetPreviewDrafts = useCallback(() => {
    setPreviewDrafts(createPreviewDraftsState());
  }, []);

  const updatePreviewSection = useCallback((section, draft, { isNew = false, id } = {}) => {
    setPreviewDrafts((prev) => {
      const currentSection = prev[section] || { edits: {}, draft: null };
      let nextSection = currentSection;
      if (isNew) {
        nextSection = { ...currentSection, draft };
      } else if (id !== undefined && id !== null) {
        nextSection = {
          ...currentSection,
          edits: {
            ...currentSection.edits,
            [id]: draft,
          },
        };
      } else {
        return prev;
      }
      return {
        ...prev,
        [section]: nextSection,
      };
    });
  }, []);

  const clearPreviewSection = useCallback((section, { isNew = false, id } = {}) => {
    setPreviewDrafts((prev) => {
      const currentSection = prev[section] || { edits: {}, draft: null };
      let nextSection = currentSection;
      if (isNew) {
        if (!currentSection.draft) {
          return prev;
        }
        nextSection = { ...currentSection, draft: null };
      } else if (id !== undefined && id !== null) {
        if (!currentSection.edits[id]) {
          return prev;
        }
        const nextEdits = { ...currentSection.edits };
        delete nextEdits[id];
        nextSection = { ...currentSection, edits: nextEdits };
      } else {
        return prev;
      }

      return {
        ...prev,
        [section]: nextSection,
      };
    });
  }, []);
  
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
        const response = await getByResumeId(id);
        const resumeRecord = response.data.data || {};
        const basicInfo = resumeRecord.basic_info || resumeRecord.basicInfo || {};
        const templateLayout = deriveTemplateLayout(resumeRecord.template);
        const templateId =
          resumeRecord.template_id ||
          resumeRecord.template?.id ||
          null;

        // Check if current user is owner or collaborator and get permissions
        const resumeOwnerId = resumeRecord.user_id;
        const currentUserId = user?.id;
        
        if (currentUserId && resumeOwnerId === currentUserId) {
          // User is the owner - has all permissions
          setUserPermissions(null);
        } else {
          // Check if user is a collaborator
          try {
            const collaboratorsResponse = await getCollaborators(id);
            if (collaboratorsResponse.data.status) {
              const currentUserCollaborator = collaboratorsResponse.data.data.find(
                (collab) => collab.user?.id === currentUserId
              );
              if (currentUserCollaborator) {
                // User is a collaborator - set their allowed sections
                setUserPermissions(currentUserCollaborator.allowed_sections || null);
              } else {
                // User is not a collaborator - no permissions
                setUserPermissions([]);
              }
            }
          } catch (error) {
            // Default to no permissions if we can't check
            setUserPermissions([]);
          }
        }

        const { full_name , job_title , phone, professional_summary , email , location, avatar, linkedin, github, website } = basicInfo;
        const { experiences } = resumeRecord;
        const { educations } = resumeRecord;
        const { skills } = resumeRecord;
        const { hobbies } = resumeRecord;
        const { certificates } = resumeRecord;
        const { languages } = resumeRecord;
        const { projects } = resumeRecord;
        const sectionOrderFromDB = resumeRecord.section_order;
        const typographyFromDB = resumeRecord.typography;
        
        // Load typography settings if they exist
        if (typographyFromDB && typeof typographyFromDB === 'object') {
          setTypography({
            font_family: typographyFromDB.font_family || "sans-serif",
            font_size: typographyFromDB.font_size || 14,
            font_id: typographyFromDB.font_id ?? null,
          });
        }
         
        // Set section order if it exists, otherwise use default
        // Always ensure fixed sections are at the beginning
        if (sectionOrderFromDB && Array.isArray(sectionOrderFromDB) && sectionOrderFromDB.length > 0) {
          setSectionOrder(ensureFixedSectionsFirst(sectionOrderFromDB));
        } else {
          setSectionOrder(defaultSectionOrder);
        }
         
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
          website: website || "",
          avatar: avatar || prev.avatar,
          experiences: experiences || [],
          educations: educations || [],
          skills: skills || [],
          hobbies: hobbies || [],
          certificates: certificates || [],
          languages: languages || [],
          projects: projects || [],
          template_id: templateId,
          template_layout: templateLayout || prev.template_layout,
        }));
        resetPreviewDrafts();

      } catch (error) {
        }
}, [id, resetPreviewDrafts, user?.id]);
  useEffect(() => {
    // Fetch resume data using the 'id' and populate formData
   fetchResumeData();
    // Example: fetchResumeData(id);
  }, [fetchResumeData,showNewExperience,showNewEducation,showNewSkill,showNewHobby,showNewCertificate,showNewLanguage,showNewProject]);

  // Fetch templates for template selector
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await getTemplates();
        if (response.data.status === 'success' && response.data.data) {
          setTemplates(response.data.data);
        } else {
        }
      } catch (error) {
        toast.error('Failed to load templates');
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Fetch active custom PDF fonts
  useEffect(() => {
    const fetchActiveFonts = async () => {
      try {
        const response = await getActivePdfFonts();
        if (response.data.status && response.data.data) {
          const custom = response.data.data.map((f) => ({
            value: f.family_name.toLowerCase(),
            label: f.family_name,
            id: f.id,
            format: f.format || "truetype",
          }));
          setCustomFontOptions(custom);
        }
      } catch (error) {
      }
    };
    fetchActiveFonts();
  }, []);

  // When custom fonts load, derive font_id and font_format from font_family if missing (e.g. loaded from DB)
  useEffect(() => {
    if (!customFontOptions.length || !typography.font_family) return;
    const match = customFontOptions.find((o) => o.value === typography.font_family);
    if (!match?.id) return;
    const updates = {};
    if (!typography.font_id) updates.font_id = match.id;
    if (!typography.font_format) updates.font_format = match.format;
    if (Object.keys(updates).length) setTypography((prev) => ({ ...prev, ...updates }));
  }, [customFontOptions, typography.font_family, typography.font_id, typography.font_format]);

  const { t, language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const localeCode = language === "fr" ? "fr" : "en";
  const shareStrings = t?.share || {};

  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);
  const [isSocialMediaOpen, setIsSocialMediaOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isHobbiesOpen, setIsHobbiesOpen] = useState(false);
  const [isCertificatesOpen, setIsCertificatesOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

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
  const verificationRequiredMessage =
    "Please verify your email address before downloading your resume.";

  const previewSourceData = useMemo(() => {
    const mergeSection = (items = [], sectionKey) => {
      const sectionDraft = previewDrafts[sectionKey] || { edits: {}, draft: null };
      const merged = (items || []).map((item, idx) => {
        const identifier = item?.id ?? `temp-${sectionKey}-${idx}`;
        if (identifier && sectionDraft.edits[identifier]) {
          return { ...item, ...sectionDraft.edits[identifier] };
        }
        return item;
      });
      return sectionDraft.draft ? [...merged, sectionDraft.draft] : merged;
    };

    return {
      ...formData,
      experiences: mergeSection(formData.experiences, "experiences"),
      educations: mergeSection(formData.educations, "educations"),
      skills: mergeSection(formData.skills, "skills"),
      hobbies: mergeSection(formData.hobbies, "hobbies"),
      certificates: mergeSection(formData.certificates, "certificates"),
      languages: mergeSection(formData.languages, "languages"),
      projects: mergeSection(formData.projects, "projects"),
    };
  }, [formData, previewDrafts]);

  const resumePreviewData = useMemo(
    () => {
      const data = buildResumeTemplateData(
        { ...previewSourceData, section_order: sectionOrder, typography },
        locale,
        {
        present: t?.preview?.present,
        }
      );
      return data;
    },
    [previewSourceData, locale, t?.preview?.present, sectionOrder, typography]
  );

  const openSection = (section) => {
    // Only open the section if it's not already open, and close all others
    if (section === "personal") {
      setIsPersonalInfoOpen(true);
    } else if (section === "socialMedia") {
      setIsSocialMediaOpen(true);
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
    } else if (section === "languages") {
      setIsLanguagesOpen(true);
    } else if (section === "projects") {
      setIsProjectsOpen(true);
    }
    
    // Close all other sections
    if (section !== "personal") {
      setIsPersonalInfoOpen(false);
    }
    if (section !== "socialMedia") {
      setIsSocialMediaOpen(false);
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
    if (section !== "languages") {
      setIsLanguagesOpen(false);
    }
    if (section !== "projects") {
      setIsProjectsOpen(false);
    }
  };

  const toggleSection = (section) => {
    // Check if the clicked section is currently open
    let isCurrentlyOpen = false;
    if (section === "personal") {
      isCurrentlyOpen = isPersonalInfoOpen;
      setIsPersonalInfoOpen(prev => !prev);
    } else if (section === "socialMedia") {
      isCurrentlyOpen = isSocialMediaOpen;
      setIsSocialMediaOpen(prev => !prev);
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
    } else if (section === "languages") {
      isCurrentlyOpen = isLanguagesOpen;
      setIsLanguagesOpen(prev => !prev);
    } else if (section === "projects") {
      isCurrentlyOpen = isProjectsOpen;
      setIsProjectsOpen(prev => !prev);
    }
    
    // Close all other sections only if we're opening a new one (not closing the current one)
    if (!isCurrentlyOpen) {
      if (section !== "personal") {
        setIsPersonalInfoOpen(false);
      }
      if (section !== "socialMedia") {
        setIsSocialMediaOpen(false);
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
      if (section !== "languages") {
        setIsLanguagesOpen(false);
      }
      if (section !== "projects") {
        setIsProjectsOpen(false);
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

  // Collaboration functions
  const loadCollaborators = async () => {
    setIsLoadingCollaborators(true);
    try {
      const response = await getCollaborators(id);
      if (response.data.status) {
        setCollaborators(response.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load collaborators");
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  const handleInviteCollaborator = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (selectedSections.length === 0) {
      toast.error("Please select at least one section the collaborator can edit");
      return;
    }

    setIsInviting(true);
    try {
      const response = await inviteCollaborator(id, inviteEmail.trim(), selectedSections);
      if (response.data.status) {
        toast.success("Invitation sent successfully!");
        setInviteEmail("");
        setSelectedSections(['basic_info', 'experiences', 'educations', 'skills', 'hobbies', 'certificates', 'languages']); // Reset to all
        loadCollaborators();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setIsInviting(false);
    }
  };

  const toggleCollaborationSection = (section) => {
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const collaborationSectionLabels = {
    projects: "Projects",
    basic_info: 'Basic Info',
    experiences: 'Experiences',
    educations: 'Education',
    skills: 'Skills',
    hobbies: 'Hobbies',
    certificates: 'Certificates',
    languages: 'Languages'
  };

  // Check if user can edit a specific section
  const canEditSection = (section) => {
    // null means owner (all permissions)
    if (userPermissions === null) {
      return true;
    }
    // Empty array means no permissions
    if (Array.isArray(userPermissions) && userPermissions.length === 0) {
      return false;
    }
    // Check if section is in allowed list
    return Array.isArray(userPermissions) && userPermissions.includes(section);
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?")) {
      return;
    }

    try {
      const response = await removeCollaborator(id, collaboratorId);
      if (response.data.status) {
        toast.success("Collaborator removed successfully");
        loadCollaborators();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove collaborator"
      );
    }
  };

  const handleDownload = async () => {
    if (!user?.email_verified_at) {
      toast.error(verificationRequiredMessage);
      return;
    }

    if (!downloadRequirementsMet) {
      toast.error(downloadRequirementMessage);
      return;
    }

    try {
      toast.loading("Generating PDF...", { id: "pdf-generation" });

      const filename = `${
        formData.full_name ? formData.full_name.replace(/\s+/g, "_") : "cv"
      }.pdf`;
      const resumePayload = buildResumeTemplateData({
        ...formData,
        section_order: sectionOrder,
        typography,
      }, locale, {
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
      toast.error(
        error.response?.data?.message ||
          "Failed to generate PDF. Please try again.",
        { id: "pdf-generation" }
      );
    }
  };

  const handleSaveTypography = async () => {
    setIsSavingTypography(true);
    try {
      await updateResume(id, { typography });
      toast.success(t?.customisePdf?.saved || "PDF settings saved!");
      setShowCustomisePdfModal(false);
    } catch (error) {
      toast.error(t?.customisePdf?.error || "Failed to save PDF settings.");
    } finally {
      setIsSavingTypography(false);
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await axiosInstance.post("/email/verification-notification");
      toast.success(t?.auth?.verify?.resent || "Verification email sent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t?.auth?.verify?.resendError ||
          "Failed to send verification email."
      );
    } finally {
      setIsSendingVerification(false);
    }
  };
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

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
        linkedin: formData.linkedin,
        github: formData.github,
        website: formData.website,
        avatar: formData.avatar || null,
      });   
      toast.success(response.data.message || "Basic info saved successfully!");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;
    try {
      toast.loading("Uploading avatar...", { id: "avatar-upload" });
      const response = await uploadResumeAvatar(id, file);
      if (response.data?.status && response.data?.avatar_url) {
        setFormData((prev) => ({
          ...prev,
          avatar: response.data.avatar_url,
        }));
        toast.success("Avatar uploaded successfully.", { id: "avatar-upload" });
      } else {
        toast.error("Failed to upload avatar", { id: "avatar-upload" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload avatar", { id: "avatar-upload" });
    }
    e.target.value = "";
  };

  // Handlers to keep accordions open and refetch data after save
  const handleExperienceSave = () => {
    setIsExperienceOpen(true);
    setShowNewExperience(false);
    clearPreviewSection("experiences", { isNew: true });
    fetchResumeData();
  };

  const handleEducationSave = () => {
    setIsEducationOpen(true);
    setShowNewEducation(false);
    clearPreviewSection("educations", { isNew: true });
    fetchResumeData();
  };

  const handleSkillSave = () => {
    setIsSkillsOpen(true);
    setShowNewSkill(false);
    clearPreviewSection("skills", { isNew: true });
    fetchResumeData();
  };

  const handleHobbySave = () => {
    setIsHobbiesOpen(true);
    setShowNewHobby(false);
    clearPreviewSection("hobbies", { isNew: true });
    fetchResumeData();
  };

  const handleCertificateSave = () => {
    setIsCertificatesOpen(true);
    setShowNewCertificate(false);
    clearPreviewSection("certificates", { isNew: true });
    fetchResumeData();
  };

  const handleLanguageSave = () => {
    setIsLanguagesOpen(true);
    setShowNewLanguage(false);
    clearPreviewSection("languages", { isNew: true });
    fetchResumeData();
  };

  const handleProjectSave = () => {
    setIsProjectsOpen(true);
    setShowNewProject(false);
    clearPreviewSection("projects", { isNew: true });
    fetchResumeData();
  };

  // Template change handler
  const handleTemplateChange = async (newTemplateId) => {
    if (!newTemplateId || newTemplateId === formData.template_id) {
      return;
    }

    setIsChangingTemplate(true);
    try {
      // Find the selected template
      const selectedTemplate = templates.find(t => t.id === newTemplateId);
      if (!selectedTemplate) {
        toast.error('Template not found');
        return;
      }

      // Derive the template layout
      const newTemplateLayout = deriveTemplateLayout(selectedTemplate);

      // Update the resume in the backend
      const response = await updateResume(id, {
        template_id: newTemplateId
      });

      if (response.data.status) {
        // Update local state
        setFormData((prev) => ({
          ...prev,
          template_id: newTemplateId,
          template_layout: newTemplateLayout,
        }));

        toast.success('Template changed successfully!');
        setShowTemplateModal(false);
      } else {
        toast.error('Failed to change template');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change template');
    } finally {
      setIsChangingTemplate(false);
    }
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

  const addLanguage = () => {
    setShowNewLanguage(true);
    openSection("languages");
  };

  const addProject = () => {
    setShowNewProject(true);
    openSection("projects");
  };

  // Drag and drop handlers for sections
    const handleSectionDragStart = (e, sectionKey) => {
      if (!isReorderMode) return;

      // Prevent dragging of fixed sections
      if (fixedSections.includes(sectionKey)) {
        e.preventDefault();
        return;
      }

      const index = sectionOrder.indexOf(sectionKey);
      setDraggedSectionIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionKey);
      e.currentTarget.style.opacity = "0.5";
    };

  const handleSectionDragEnd = (e) => {
    if (!isReorderMode) return;
    e.currentTarget.style.opacity = "1";
    setDraggedSectionIndex(null);
    setDragOverSectionIndex(null);
  };

    const handleSectionDragOver = (e, sectionKey) => {
      if (!isReorderMode) return;

      // Don't allow dropping on fixed sections
      if (fixedSections.includes(sectionKey)) {
        setDragOverSectionIndex(null);
        return;
      }

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const index = sectionOrder.indexOf(sectionKey);
      setDragOverSectionIndex(index);
    };

  const handleSectionDragLeave = () => {
    if (!isReorderMode) return;
    setDragOverSectionIndex(null);
  };

  const handleSectionDrop = (e, dropSectionKey) => {
    if (!isReorderMode) return;
    e.preventDefault();

    const draggedSectionKey = e.dataTransfer.getData("text/plain");

    if (!draggedSectionKey || draggedSectionKey === dropSectionKey || fixedSections.includes(draggedSectionKey)) {
      setDragOverSectionIndex(null);
      return;
    }

    // Don't allow dropping on fixed sections
    if (fixedSections.includes(dropSectionKey)) {
      setDragOverSectionIndex(null);
      return;
    }

    const draggedIndex = sectionOrder.indexOf(draggedSectionKey);
    const dropIndex = sectionOrder.indexOf(dropSectionKey);


    if (draggedIndex === -1 || dropIndex === -1) return;

    // Separate fixed and movable sections
    const fixedPart = sectionOrder.slice(0, fixedSections.length);
    const movablePart = sectionOrder.slice(fixedSections.length);

    // Find the dragged item in the movable part
    const movableIndex = movablePart.indexOf(draggedSectionKey);
    if (movableIndex === -1) return; // Shouldn't happen, but safety check

    // Remove from movable part
    const [draggedItem] = movablePart.splice(movableIndex, 1);

    // Calculate the drop position within the movable part
    const adjustedDropIndex = dropIndex - fixedSections.length;

    // Insert at new position in movable part
    movablePart.splice(adjustedDropIndex, 0, draggedItem);

    // Combine back and ensure fixed sections are first
    const newOrder = [...fixedPart, ...movablePart];

    setSectionOrder(ensureFixedSectionsFirst(newOrder));
    setDragOverSectionIndex(null);
    setDraggedSectionIndex(null);
  };

  

 


 

  const accordionThemes = {
    personal: {
      openContainer:
        "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-white shadow-lg shadow-blue-100",
      iconOpen: "bg-blue-600 text-white shadow-blue-200",
      chevron: "text-blue-600",
    },
    socialMedia: {
      openContainer:
        "border-teal-500 bg-gradient-to-br from-teal-50 via-white to-white shadow-lg shadow-teal-100",
      iconOpen: "bg-teal-600 text-white shadow-teal-200",
      chevron: "text-teal-600",
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
    languages: {
      openContainer:
        "border-cyan-500 bg-gradient-to-br from-cyan-50 via-white to-white shadow-lg shadow-cyan-100",
      iconOpen: "bg-cyan-500 text-white shadow-cyan-200",
      chevron: "text-cyan-600",
    },
    projects: {
      openContainer:
        "border-violet-500 bg-gradient-to-br from-violet-50 via-white to-white shadow-lg shadow-violet-100",
      iconOpen: "bg-violet-500 text-white shadow-violet-200",
      chevron: "text-violet-600",
    },
  };

  const sectionLabels = {
    personal: t.preview?.sectionLabelPersonal || "01 Personal Info",
    socialMedia: t.preview?.sectionLabelSocialMedia || "02 Social Media",
    experience: t.preview?.sectionLabelExperience || "03 Experience",
    languages: t.preview?.sectionLabelLanguages || "08 Languages",
    education: t.preview?.sectionLabelEducation || "04 Education",
    skills: t.preview?.sectionLabelSkills || "05 Skills",
    hobbies: t.preview?.sectionLabelHobbies || "06 Hobbies",
    certificates: t.preview?.sectionLabelCertificates || "07 Certificates",
    projects: t.preview?.sectionLabelProjects || "09 Projects",
  };

    // Helper function to render a section wrapper with drag handlers
    const renderSectionWrapper = (sectionKey, children) => {
      const sectionIndex = sectionOrder.indexOf(sectionKey);
      const isFixed = fixedSections.includes(sectionKey);
      return (
        <div
          key={sectionKey}
          draggable={isReorderMode && !isFixed}
          onDragStart={(e) => handleSectionDragStart(e, sectionKey)}
          onDragEnd={handleSectionDragEnd}
          onDragOver={(e) => handleSectionDragOver(e, sectionKey)}
          onDragLeave={handleSectionDragLeave}
          onDrop={(e) => handleSectionDrop(e, sectionKey)}
          className={`${getAccordionClasses(sectionKey,
            sectionKey === "personal" ? isPersonalInfoOpen :
            sectionKey === "socialMedia" ? isSocialMediaOpen :
            sectionKey === "experience" ? isExperienceOpen :
            sectionKey === "education" ? isEducationOpen :
            sectionKey === "skills" ? isSkillsOpen :
            sectionKey === "hobbies" ? isHobbiesOpen :
            sectionKey === "certificates" ? isCertificatesOpen :
            sectionKey === "languages" ? isLanguagesOpen :
            sectionKey === "projects" ? isProjectsOpen : false
          )} ${
            isReorderMode && !isFixed ? "cursor-move" : ""
          } ${
            isReorderMode && isFixed ? "cursor-not-allowed opacity-75" : ""
          } ${
            draggedSectionIndex !== null && sectionIndex === draggedSectionIndex
              ? "opacity-50"
              : ""
          } ${
            dragOverSectionIndex !== null && sectionIndex === dragOverSectionIndex
              ? "ring-2 ring-blue-400 ring-offset-2"
              : ""
          }`}
        >
        {children}
      </div>
    );
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
          {!user?.email_verified_at && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-2xl shadow-sm">
              <div>
                <p className="text-sm font-semibold">
                  {t?.auth?.verify?.title || "Verify your email"}
                </p>
                <p className="text-sm text-amber-800">
                  {t?.auth?.verify?.subtitle ||
                    "Please verify your email address before downloading your resume."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold shadow hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingVerification && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t?.auth?.verify?.resend || "Resend verification email"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel - CV Form */}
          <div className="p-3 bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl rounded-3xl overflow-hidden self-start">
            <div className="mb-4 flex justify-end">
              <SectionOrderManager
                sections={defaultSectionOrder}
                sectionOrder={sectionOrder}
                onOrderChange={handleSectionOrderChange}
                resumeId={id}
                sectionLabels={sectionLabels}
                isReorderMode={isReorderMode}
                onToggleReorderMode={setIsReorderMode}
              />
            </div>
            {isReorderMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Reorder Mode:</strong> Drag sections directly to reorder them. The preview updates in real-time.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {sectionOrder.map((sectionKey) => {
                // Skip sections that shouldn't be rendered
                if (sectionKey === "socialMedia" && !canEditSection('basic_info')) return null;
                if (sectionKey === "experience" && !canEditSection('experiences')) return null;
                if (sectionKey === "skills" && !canEditSection('skills')) return null;
                if (sectionKey === "hobbies" && !canEditSection('hobbies')) return null;
                if (sectionKey === "certificates" && !canEditSection('certificates')) return null;
                if (sectionKey === "languages" && !canEditSection('languages')) return null;
                if (sectionKey === "projects" && !canEditSection('projects')) return null;

                // Personal Info Section
                if (sectionKey === "personal") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                        onClick={() => !isReorderMode && toggleSection("personal")}
                  className={getAccordionButtonClasses(isPersonalInfoOpen)}
                  aria-expanded={isPersonalInfoOpen}
                        disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                          {isReorderMode && !fixedSections.includes("personal") && (
                            <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-5 w-5" />
                            </div>
                          )}
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
                    <div className="flex items-center justify-center gap-3 py-3">
                      <span className="text-sm font-medium text-gray-700">
                        {t.dashboard.sections.personalInfo?.showPhotoOnCv ?? "Show photo on CV"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.show_photo_on_cv}
                        onClick={() => setFormData((prev) => ({ ...prev, show_photo_on_cv: !prev.show_photo_on_cv }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData.show_photo_on_cv ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            formData.show_photo_on_cv ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
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
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
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
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
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
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
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
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
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
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
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
                          disabled={!canEditSection('basic_info')}
                          className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm p-4 ${
                            !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          placeholder={t.dashboard.sections.personalInfo.summaryPlaceholder}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={hasValidationErrors() || isLoading || !canEditSection('basic_info')}
                        className={`${buttonVariants.primary} ${
                          hasValidationErrors() || isLoading || !canEditSection('basic_info') ? disabledButtonClasses : ""
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
                    </>
                  );
                }

                // Social Media Section
                if (sectionKey === "socialMedia") {
                  return renderSectionWrapper(sectionKey,
                    <>
                      <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("socialMedia")}
                  className={getAccordionButtonClasses(isSocialMediaOpen)}
                  aria-expanded={isSocialMediaOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && !fixedSections.includes("socialMedia") && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
                    <div className={getAccordionIconClasses("socialMedia", isSocialMediaOpen)}>
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.socialMedia}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.socialMedia?.title || "Social Media"}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("socialMedia", isSocialMediaOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isSocialMediaOpen ? "max-h-[2000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isSocialMediaOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.socialMedia?.linkedin || "LinkedIn"} {" "}
                          <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleChange}
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            placeholder={t.dashboard.sections.socialMedia?.linkedinPlaceholder || "https://linkedin.com/in/yourprofile"}
                          />
                </div>
              </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.socialMedia?.github || "GitHub"} {" "}
                          <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            placeholder={t.dashboard.sections.socialMedia?.githubPlaceholder || "https://github.com/yourusername"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.dashboard.sections.socialMedia?.website || "Website"} {" "}
                          <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            disabled={!canEditSection('basic_info')}
                            className={`mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm pl-4 py-2.5 ${
                              !canEditSection('basic_info') ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            placeholder={t.dashboard.sections.socialMedia?.websitePlaceholder || "https://yourwebsite.com"}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                <button
                  type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !canEditSection('basic_info')}
                        className={`${buttonVariants.primary} ${
                          isLoading || !canEditSection('basic_info') ? disabledButtonClasses : ""
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
                    </>
                  );
                }

                // Experience Section
                if (sectionKey === "experience") {
                  return renderSectionWrapper(sectionKey,
                    <>
                      <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("experience")}
                  className={getAccordionButtonClasses(isExperienceOpen)}
                  aria-expanded={isExperienceOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
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
                        hide={() => {
                          setShowNewExperience(false);
                          clearPreviewSection("experiences", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleExperienceSave}
                        onPreviewChange={(draft) => updatePreviewSection("experiences", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("experiences", { isNew: true })}
                      />
                    )}

                    {formData.experiences.map((exp, index) => {
                      const experiencePreviewId = exp.id ?? `experience-${index}`;
                      return (
                        <ShowExperience
                          key={experiencePreviewId}
                          exp={exp}
                          index={index}
                          hide={() => setShowNewExperience(false)}
                          resumeId={id}
                          onSave={handleExperienceSave}
                          onDelete={handleExperienceSave}
                          onPreviewChange={(draft) =>
                            updatePreviewSection("experiences", draft, { id: experiencePreviewId })
                          }
                          onPreviewClear={() => clearPreviewSection("experiences", { id: experiencePreviewId })}
                        />
                      );
                    })}
                  </div>
                </div>
                    </>
                  );
                }

                // Education Section
                if (sectionKey === "education") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("education")}
                  className={getAccordionButtonClasses(isEducationOpen)}
                  aria-expanded={isEducationOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
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
                        hide={() => {
                          setShowNewEducation(false);
                          clearPreviewSection("educations", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleEducationSave}
                        onPreviewChange={(draft) => updatePreviewSection("educations", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("educations", { isNew: true })}
                      />
                    )}

                    {formData.educations.map((exp, index) => {
                      const educationPreviewId = exp.id ?? `education-${index}`;
                      return (
                        <ShowEducation
                          key={educationPreviewId}
                          exp={exp}
                          index={index}
                          hide={() => setShowNewEducation(false)}
                          resumeId={id}
                          onSave={handleEducationSave}
                          onDelete={handleEducationSave}
                          onPreviewChange={(draft) =>
                            updatePreviewSection("educations", draft, { id: educationPreviewId })
                          }
                          onPreviewClear={() => clearPreviewSection("educations", { id: educationPreviewId })}
                        />
                      );
                    })}
                  </div>
                </div>
                    </>
                  );
                }

                // Skills Section
                if (sectionKey === "skills") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("skills")}
                  className={getAccordionButtonClasses(isSkillsOpen)}
                  aria-expanded={isSkillsOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
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
                        hide={() => {
                          setShowNewSkill(false);
                          clearPreviewSection("skills", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleSkillSave}
                        onPreviewChange={(draft) => updatePreviewSection("skills", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("skills", { isNew: true })}
                      />
                    )}

                    {formData.skills &&
                      formData.skills.map((skill, index) => {
                        const skillPreviewId = skill.id ?? `skill-${index}`;
                        return (
                          <ShowSkill
                            key={skillPreviewId}
                            skill={skill}
                            index={index}
                            hide={() => setShowNewSkill(false)}
                            resumeId={id}
                            onSave={handleSkillSave}
                            onDelete={handleSkillSave}
                            onPreviewChange={(draft) =>
                              updatePreviewSection("skills", draft, { id: skillPreviewId })
                            }
                            onPreviewClear={() => clearPreviewSection("skills", { id: skillPreviewId })}
                          />
                        );
                      })}
                      
                  </div>
                </div>
                    </>
                  );
                }

                // Hobbies Section
                if (sectionKey === "hobbies") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("hobbies")}
                  className={getAccordionButtonClasses(isHobbiesOpen)}
                  aria-expanded={isHobbiesOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
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
                        hide={() => {
                          setShowNewHobby(false);
                          clearPreviewSection("hobbies", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleHobbySave}
                        onPreviewChange={(draft) => updatePreviewSection("hobbies", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("hobbies", { isNew: true })}
                      />
                    )}

                    {formData.hobbies &&
                      formData.hobbies.map((hobby, index) => {
                        const hobbyPreviewId = hobby.id ?? `hobby-${index}`;
                        return (
                          <ShowHobby
                            key={hobbyPreviewId}
                            hobby={hobby}
                            index={index}
                            hide={() => setShowNewHobby(false)}
                            resumeId={id}
                            onSave={handleHobbySave}
                            onDelete={handleHobbySave}
                            onPreviewChange={(draft) =>
                              updatePreviewSection("hobbies", draft, { id: hobbyPreviewId })
                            }
                            onPreviewClear={() => clearPreviewSection("hobbies", { id: hobbyPreviewId })}
                          />
                        );
                      })}
                  </div>
                </div>
                    </>
                  );
                }

                // Certificates Section
                if (sectionKey === "certificates") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("certificates")}
                  className={getAccordionButtonClasses(isCertificatesOpen)}
                  aria-expanded={isCertificatesOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
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
                        hide={() => {
                          setShowNewCertificate(false);
                          clearPreviewSection("certificates", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleCertificateSave}
                        onPreviewChange={(draft) => updatePreviewSection("certificates", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("certificates", { isNew: true })}
                      />
                    )}

                    {formData.certificates &&
                      formData.certificates.map((certificate, index) => {
                        const certificatePreviewId = certificate.id ?? `certificate-${index}`;
                        return (
                          <ShowCertificate
                            key={certificatePreviewId}
                            certificate={certificate}
                            index={index}
                            hide={() => setShowNewCertificate(false)}
                            resumeId={id}
                            onSave={handleCertificateSave}
                            onDelete={handleCertificateSave}
                            onPreviewChange={(draft) =>
                              updatePreviewSection("certificates", draft, { id: certificatePreviewId })
                            }
                            onPreviewClear={() =>
                              clearPreviewSection("certificates", { id: certificatePreviewId })
                            }
                          />
                        );
                      })}
                  </div>
                </div>
                    </>
                  );
                }

                // Languages Section
                if (sectionKey === "languages") {
                  return renderSectionWrapper(sectionKey,
                    <>
                <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("languages")}
                  className={getAccordionButtonClasses(isLanguagesOpen)}
                  aria-expanded={isLanguagesOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
                    <div className={getAccordionIconClasses("languages", isLanguagesOpen)}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.languages}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.languages.title}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("languages", isLanguagesOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isLanguagesOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isLanguagesOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addLanguage}
                      className={`mt-2 mb-4 ${buttonBase} border border-cyan-200 bg-cyan-50/80 text-cyan-700 px-4 py-2 text-sm hover:bg-cyan-100 focus:ring-cyan-300 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.languages.addLanguage}
                    </button>

                    {showNewLanguage && (
                      <NewLanguage
                        index={formData.languages ? formData.languages.length : 0}
                        hide={() => {
                          setShowNewLanguage(false);
                          clearPreviewSection("languages", { isNew: true });
                        }}
                        resumeId={id}
                        onSave={handleLanguageSave}
                        onPreviewChange={(draft) => updatePreviewSection("languages", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("languages", { isNew: true })}
                      />
                    )}

                    {formData.languages &&
                      formData.languages.map((language, index) => {
                        const languagePreviewId = language.id ?? `language-${index}`;
                        return (
                          <ShowLanguage
                            key={languagePreviewId}
                            lang={language}
                            index={index}
                            hide={() => setShowNewLanguage(false)}
                            resumeId={id}
                            onSave={handleLanguageSave}
                            onDelete={handleLanguageSave}
                            onPreviewChange={(draft) =>
                              updatePreviewSection("languages", draft, { id: languagePreviewId })
                            }
                            onPreviewClear={() => clearPreviewSection("languages", { id: languagePreviewId })}
                          />
                        );
                      })}
                  </div>
                </div>
                    </>
                  );
                }

                // Projects Section
                if (sectionKey === "projects") {
                  return renderSectionWrapper(sectionKey,
                    <>
                      <button
                  type="button"
                  onClick={() => !isReorderMode && toggleSection("projects")}
                  className={getAccordionButtonClasses(isProjectsOpen)}
                  aria-expanded={isProjectsOpen}
                  disabled={isReorderMode}
                >
                  <div className="flex items-center gap-3">
                    {isReorderMode && (
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
              </div>
              )}
                    <div className={getAccordionIconClasses("projects", isProjectsOpen)}>
                      <FolderGit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {sectionLabels.projects}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {t.dashboard.sections.projects.title || "Projects"}
                      </h2>
                    </div>
                  </div>
                  <ChevronDown className={getChevronClasses("projects", isProjectsOpen)} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    isProjectsOpen ? "max-h-[3000px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 transition-all duration-300 ${
                      isProjectsOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={addProject}
                      className={`mt-2 mb-4 ${buttonBase} border border-violet-200 bg-violet-50/80 text-violet-700 px-4 py-2 text-sm hover:bg-violet-100 focus:ring-violet-300 focus:ring-offset-white`}
                    >
                      {t.dashboard.sections.projects.addProject || "Add Project"}
                    </button>

                    {showNewProject && (
                      <NewProject
                        index={formData.projects ? formData.projects.length : 0}
                        hide={() => {
                          setShowNewProject(false);
                          clearPreviewSection("projects", { isNew: true });
                        }}
                        resumeId={id}
                        experiences={formData.experiences || []}
                        onSave={handleProjectSave}
                        onPreviewChange={(draft) => updatePreviewSection("projects", draft, { isNew: true })}
                        onPreviewClear={() => clearPreviewSection("projects", { isNew: true })}
                      />
                    )}

                    {formData.projects &&
                      formData.projects.map((project, index) => {
                        const projectPreviewId = project.id ?? `project-${index}`;
                        return (
                          <ShowProject
                            key={projectPreviewId}
                            project={project}
                            index={index}
                            hide={() => setShowNewProject(false)}
                            resumeId={id}
                            experiences={formData.experiences || []}
                            onSave={handleProjectSave}
                            onDelete={handleProjectSave}
                            onPreviewChange={(draft) =>
                              updatePreviewSection("projects", draft, { id: projectPreviewId })
                            }
                            onPreviewClear={() => clearPreviewSection("projects", { id: projectPreviewId })}
                          />
                        );
                      })}
                  </div>
                </div>
                    </>
                  );
                }

                return null;
              })}
            </form>
          </div>

          {/* Right Panel - CV Preview */}
          <div className="w-full xl:sticky top-8 space-y-6 self-start">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className={`${buttonVariants.outline} text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 border-green-300 text-green-700 hover:bg-green-50 group flex items-center overflow-hidden transition-all duration-200`}
                    title="Change template"
                  >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>Template</span>
                  </button>
                  <button
                    onClick={() => setIsFullPagePreview(true)}
                    className={`${buttonVariants.outline} text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 group flex items-center overflow-hidden transition-all duration-200`}
                    title="Full page preview"
                  >
                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>{t.nav.fullPage}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      loadShareableLink();
                    }}
                    className={`${buttonVariants.purple} text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 group flex items-center overflow-hidden transition-all duration-200`}
                    title={shareStrings.buttonTitle || "Share CV"}
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>{shareStrings.button || "Share"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCollaborationModal(true);
                      loadCollaborators();
                    }}
                    className={`${buttonVariants.outline} text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 border-blue-300 text-blue-700 hover:bg-blue-50 group flex items-center overflow-hidden transition-all duration-200`}
                    title="Share for editing"
                  >
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>Collaborate</span>
                  </button>
                  <button
                    onClick={() => setShowCustomisePdfModal(true)}
                    className={`${buttonVariants.outline} text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 border-amber-300 text-amber-700 hover:bg-amber-50 group flex items-center overflow-hidden transition-all duration-200`}
                    title={t?.customisePdf?.title || "Customise PDF"}
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>{t?.customisePdf?.button || "PDF Style"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!downloadRequirementsMet}
                    title={
                      downloadRequirementsMet ? undefined : downloadRequirementMessage
                    }
                    className={`${buttonVariants.blueSolid} ${
                      !downloadRequirementsMet ? disabledButtonClasses : ""
                    } text-xs sm:text-sm px-2 sm:px-2 py-1.5 sm:py-2.5 group flex items-center overflow-hidden transition-all duration-200`}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className={toolbarLabelClass}>{t.nav.download}</span>
                  </button>
                </div>
              </div>
            <ResumeTemplatePreview
              resume={resumePreviewData}
              templateKey={formData.template_layout}
            />
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
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  <span className="hidden sm:inline">{t.nav.preview} - </span>{t.preview.fullPageView}
                </h2>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={handleDownload}
                    disabled={!downloadRequirementsMet}
                    title={
                      downloadRequirementsMet ? undefined : downloadRequirementMessage
                    }
                    className={`${buttonVariants.blueSolid} ${
                      !downloadRequirementsMet ? disabledButtonClasses : ""
                    } text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2.5`}
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t.nav.download}</span>
                  </button>
                  <button
                    onClick={() => setIsFullPagePreview(false)}
                    className={`${buttonBase} p-1.5 sm:p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 focus:ring-slate-300 focus:ring-offset-white`}
                    title="Close"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Full Page Preview Content */}
              <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div
                  className="bg-white rounded-lg mx-auto"
                  style={{ width: '210mm', minHeight: '297mm' }}
                >
                  <ResumeTemplatePreview
                    resume={resumePreviewData}
                    templateKey={formData.template_layout}
                  />
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

      {/* Template Change Modal */}
      {showTemplateModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75"
          onClick={() => setShowTemplateModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Change Template
                  </h2>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                    <span className="ml-3 text-gray-600">Loading templates...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6 text-sm">
                      Select a new template for your resume. Your content will remain the same, only the layout will change.
                    </p>
                    {templates.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No templates available</p>
                        <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {templates.map((template) => {
                        const isSelected = template.id === formData.template_id;
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateChange(template.id)}
                            disabled={isChangingTemplate || isSelected}
                            className={`relative text-left border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                              isSelected
                                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                : 'border-gray-200 bg-white hover:border-green-300'
                            } ${isChangingTemplate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                            {template.preview_image_url ? (
                              <img
                                src={template.preview_image_url}
                                alt={template.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <div className={`${template.preview_image_url ? 'hidden' : ''} w-full h-32 bg-gradient-to-br from-green-50 to-white rounded-lg mb-3 flex items-center justify-center`}>
                              <Sparkles className="h-8 w-8 text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {template.description || 'Professional template'}
                            </p>
                            {template.category && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                {template.category}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      </div>
                    )}
                    {isChangingTemplate && (
                      <div className="mt-4 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-green-600 mr-2" />
                        <span className="text-gray-600">Changing template...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customise PDF Modal */}
      {showCustomisePdfModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75"
          onClick={() => setShowCustomisePdfModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Settings className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t?.customisePdf?.title || "Customise PDF"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowCustomisePdfModal(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <p className="text-sm text-gray-500">
                  {t?.customisePdf?.description || "Customise the font and size used when generating your PDF resume."}
                </p>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t?.customisePdf?.fontFamily || "Font Family"}
                  </label>
                  <select
                    value={typography.font_family}
                    onChange={(e) => {
                      const val = e.target.value;
                      const opt = pdfFontOptions.find((o) => o.value === val);
                      setTypography((prev) => ({
                        ...prev,
                        font_family: val,
                        font_id: opt?.id ?? null,
                        font_format: opt?.format ?? null,
                      }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  >
                    {pdfFontOptions.map((font) => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t?.customisePdf?.fontSize || "Font Size"} — <span className="text-amber-600 font-semibold">{typography.font_size}px</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={20}
                    step={1}
                    value={typography.font_size}
                    onChange={(e) => setTypography((prev) => ({ ...prev, font_size: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10px</span>
                    <span>14px</span>
                    <span>20px</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 mb-2">{t?.customisePdf?.preview || "Preview"}</p>
                  <p style={{ fontFamily: typography.font_family, fontSize: `${typography.font_size}px` }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomisePdfModal(false)}
                  className={`${buttonVariants.outline} px-4 py-2 text-sm`}
                >
                  {t?.common?.cancel || "Cancel"}
                </button>
                <button
                  onClick={handleSaveTypography}
                  disabled={isSavingTypography}
                  className={`${buttonVariants.primary} px-4 py-2 text-sm ${isSavingTypography ? disabledButtonClasses : ""}`}
                >
                  {isSavingTypography ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t?.common?.loading || "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{t?.customisePdf?.save || "Save Settings"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75"
          onClick={() => setShowCollaborationModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Share for Editing
                  </h2>
                </div>
                <button
                  onClick={() => setShowCollaborationModal(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 text-sm">
                  Invite someone to collaborate on this resume. Select which sections they can edit.
                </p>

                {/* Verification Warning */}
                {!user?.email_verified_at && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <ShieldCheck className="h-4 w-4 inline mr-1" />
                      Please verify your email address before inviting collaborators to your resume.
                    </p>
                  </div>
                )}

                {/* Invite Form */}
                <form onSubmit={handleInviteCollaborator} className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !user?.email_verified_at ? disabledButtonClasses : ""
                      }`}
                      required
                      disabled={!user?.email_verified_at}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sections They Can Edit
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {Object.entries(collaborationSectionLabels).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(key)}
                            onChange={() => toggleCollaborationSection(key)}
                            disabled={!user?.email_verified_at}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                    {selectedSections.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">Please select at least one section</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isInviting || !user?.email_verified_at || selectedSections.length === 0}
                    className={`${buttonVariants.primary} w-full px-4 py-2 ${
                      isInviting || !user?.email_verified_at || selectedSections.length === 0 ? disabledButtonClasses : ""
                    }`}
                    title={!user?.email_verified_at ? "Please verify your email address to invite collaborators" : ""}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span className="ml-2">Send Invitation</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Collaborators List */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Collaborators ({collaborators.length})
                  </h3>
                  {isLoadingCollaborators ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  ) : collaborators.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No collaborators yet. Invite someone to get started!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {collaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {collaborator.user?.name || collaborator.invited_email}
                              </p>
                              <p className="text-xs text-gray-500">
                                {collaborator.accepted_at 
                                  ? `Joined ${new Date(collaborator.accepted_at).toLocaleDateString()}`
                                  : "Pending invitation"
                                }
                              </p>
                              {collaborator.allowed_sections && collaborator.allowed_sections.length > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Can edit: {collaborator.allowed_sections.map(s => collaborationSectionLabels[s] || s).join(', ')}
                                </p>
                              )}
                              {(!collaborator.allowed_sections || collaborator.allowed_sections.length === 0) && collaborator.accepted_at && (
                                <p className="text-xs text-gray-400 mt-1">All sections</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove collaborator"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
