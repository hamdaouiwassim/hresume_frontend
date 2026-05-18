import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ArrowLeft,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { viewPublicWebsiteResume, downloadPublicProfilePdf } from "../services/ShareableLinkService";
import { useLanguage } from "../context/LanguageContext";

function upsertNamedMeta(name, content) {
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute("data-public-profile-seo", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

function upsertPropertyMeta(property, content) {
  if (typeof document === "undefined") return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute("data-public-profile-seo", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

function upsertCanonical(href) {
  if (typeof document === "undefined") return;
  let el = document.querySelector('link[rel="canonical"][data-public-profile-seo="1"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute("data-public-profile-seo", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function clearPublicProfileSeo() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-public-profile-seo]").forEach((n) => n.remove());
}

export default function PersonalWebsiteView() {
  const { slug, token } = useParams();
  const identifier = slug ?? token;
  const { language } = useLanguage();
  const localeCode = language === "fr" ? "fr" : "en";

  const [resume, setResume] = useState(null);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      if (!identifier) {
        setError("Missing profile address.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await viewPublicWebsiteResume(identifier);
        if (response.data?.status) {
          setResume(response.data.data);
          setPageMeta(response.data.meta || null);
        } else {
          setError(response.data?.message || "Unable to load profile.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "This profile is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [identifier]);

  useEffect(() => {
    const defaultTitle = "HResume - Free Professional Resume Builder | Create Your CV Online";
    if (!pageMeta?.title) {
      return undefined;
    }
    const prevTitle = document.title;
    document.title = pageMeta.title;
    upsertNamedMeta("description", pageMeta.description || "");
    upsertPropertyMeta("og:title", pageMeta.title);
    upsertPropertyMeta("og:description", pageMeta.description || "");
    upsertNamedMeta("robots", pageMeta.robots || "index, follow");
    if (typeof window !== "undefined") {
      upsertPropertyMeta("og:url", `${window.location.origin}${window.location.pathname}`);
      upsertCanonical(`${window.location.origin}${window.location.pathname}`);
    }

    return () => {
      document.title = prevTitle;
      clearPublicProfileSeo();
    };
  }, [pageMeta]);

  const basicInfo = useMemo(() => resume?.basic_info || {}, [resume]);
  const experiences = resume?.experiences || [];
  const educations = resume?.educations || [];
  const skills = resume?.skills || [];
  const projects = resume?.projects || [];
  const certifications = resume?.certificates || [];
  const [theme, setTheme] = useState("indigo");
  const [showSections, setShowSections] = useState({
    summary: true,
    experience: true,
    projects: true,
    skills: true,
    education: true,
    certifications: true,
  });

  const themeClasses = useMemo(() => {
    if (theme === "emerald") {
      return {
        hero: "from-emerald-700 via-teal-700 to-emerald-800",
        badge: "bg-emerald-50 text-emerald-700",
        chip: "bg-emerald-50 text-emerald-700",
      };
    }
    if (theme === "slate") {
      return {
        hero: "from-slate-800 via-slate-700 to-slate-900",
        badge: "bg-slate-100 text-slate-700",
        chip: "bg-slate-100 text-slate-700",
      };
    }
    return {
      hero: "from-indigo-700 via-purple-700 to-indigo-800",
      badge: "bg-indigo-50 text-indigo-700",
      chip: "bg-indigo-50 text-indigo-700",
    };
  }, [theme]);

  const canPublicPdf = Boolean(slug && pageMeta?.profile_slug === slug);

  const handleDownloadPdf = async () => {
    if (!canPublicPdf || !slug) {
      toast.error(
        language === "fr"
          ? "Le PDF public est disponible pour les profils /u/votre-slug."
          : "Public PDF download is available for stable /u/your-slug profiles."
      );
      return;
    }
    setIsPdfDownloading(true);
    try {
      toast.loading(
        language === "fr" ? "Generation du PDF..." : "Generating PDF...",
        { id: "public-pdf" }
      );
      const response = await downloadPublicProfilePdf(slug, localeCode);
      const filename = `${resume?.name || basicInfo.full_name || "cv"}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(
        language === "fr" ? "PDF telecharge." : "PDF downloaded.",
        { id: "public-pdf" }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (language === "fr" ? "Echec du PDF." : "Could not download PDF."),
        { id: "public-pdf" }
      );
    } finally {
      setIsPdfDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading personal website...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
          <Globe className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Profile unavailable</h1>
          <p className="text-slate-600 mb-4">{error || "This public profile could not be loaded."}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`bg-gradient-to-r ${themeClasses.hero} text-white`}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4">
              {basicInfo.avatar ? (
                <img
                  src={basicInfo.avatar}
                  alt={basicInfo.full_name || "Profile avatar"}
                  className="h-20 w-20 rounded-full object-cover border-2 border-white/40"
                />
              ) : null}
              <div>
                <h1 className="text-3xl font-bold">{basicInfo.full_name || resume.name || "Professional Profile"}</h1>
                <p className="text-indigo-100 mt-1">{basicInfo.job_title || "Career Profile"}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-sm">
                <Globe className="h-4 w-4 mr-2" />
                Public profile
              </span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isPdfDownloading || !canPublicPdf}
                title={
                  canPublicPdf
                    ? undefined
                    : language === "fr"
                      ? "Disponible pour les URLs /u/slug"
                      : "Available for /u/slug public profiles"
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPdfDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {language === "fr" ? "Telecharger le CV (PDF)" : "Download CV (PDF)"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-indigo-100">
            {basicInfo.email ? (
              <span className="inline-flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {basicInfo.email}
              </span>
            ) : null}
            {basicInfo.phone ? (
              <span className="inline-flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {basicInfo.phone}
              </span>
            ) : null}
            {basicInfo.location ? (
              <span className="inline-flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {basicInfo.location}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Theme</span>
              <button
                type="button"
                onClick={() => setTheme("indigo")}
                className={`px-3 py-1 rounded-full text-xs ${theme === "indigo" ? themeClasses.badge : "bg-slate-100 text-slate-600"}`}
              >
                Indigo
              </button>
              <button
                type="button"
                onClick={() => setTheme("emerald")}
                className={`px-3 py-1 rounded-full text-xs ${theme === "emerald" ? themeClasses.badge : "bg-slate-100 text-slate-600"}`}
              >
                Emerald
              </button>
              <button
                type="button"
                onClick={() => setTheme("slate")}
                className={`px-3 py-1 rounded-full text-xs ${theme === "slate" ? themeClasses.badge : "bg-slate-100 text-slate-600"}`}
              >
                Slate
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                ["summary", "Summary"],
                ["experience", "Experience"],
                ["projects", "Projects"],
                ["skills", "Skills"],
                ["education", "Education"],
                ["certifications", "Certs"],
              ].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setShowSections((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`px-3 py-1 rounded-full text-xs ${
                    showSections[key] ? themeClasses.badge : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {showSections.summary && basicInfo.professional_summary ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">About Me</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{basicInfo.professional_summary}</p>
          </section>
        ) : null}

        {showSections.experience && experiences.length > 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
              Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={`${exp.id || idx}-${idx}`}
                  className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="font-medium text-slate-900">
                    {exp.position || "Role"} {exp.company ? `- ${exp.company}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    {exp.startDate || exp.start_date || ""}{" "}
                    {exp.endDate || exp.end_date ? `to ${exp.endDate || exp.end_date}` : ""}
                  </p>
                  {exp.description ? (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {showSections.projects && projects.length > 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Projects</h2>
            <div className="space-y-3">
              {projects.map((project, idx) => (
                <div key={`${project.id || idx}-${idx}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{project.name || "Project"}</p>
                  {project.description ? (
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{project.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {showSections.skills && skills.length > 0 ? (
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={`${skill.id || skill.name || idx}-${idx}`}
                    className={`px-3 py-1 rounded-full text-sm ${themeClasses.chip}`}
                  >
                    {skill.name || skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {showSections.education && educations.length > 0 ? (
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                Education
              </h2>
              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div key={`${edu.id || idx}-${idx}`}>
                    <p className="font-medium text-slate-900">{edu.degree || "Degree"}</p>
                    <p className="text-sm text-slate-600">{edu.institution || ""}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {showSections.certifications && certifications.length > 0 ? (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center">
              <Award className="h-5 w-5 mr-2 text-indigo-600" />
              Certifications
            </h2>
            <ul className="space-y-2">
              {certifications.map((cert, idx) => (
                <li key={`${cert.id || idx}-${idx}`} className="text-sm text-slate-700">
                  {cert.name || cert.title || "Certification"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
