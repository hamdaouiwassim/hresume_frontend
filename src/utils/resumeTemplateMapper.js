const formatDate = (value, locale = "en-US") => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
};

const splitDescription = (text) => {
  if (!text) return [];
  return text
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
};

export const buildResumeTemplateData = (
  data = {},
  locale = "en-US",
  labels = {}
) => {
  const templateLayout =
    data.template_layout && typeof data.template_layout === "string"
      ? data.template_layout
      : "classic";
  const templateId = data.template_id || null;

  const presentLabel =
    labels.present || (locale.startsWith("fr") ? "En cours" : "Present");
  const contact = {
    location: data.location || "",
    email: data.email || "",
    phone: data.phone || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    website: data.website || "",
    profile_picture: data.profile_picture || data.profilePicture || "",
  };

  const experience = Array.isArray(data.experiences)
    ? data.experiences.map((exp) => {
        const start = formatDate(exp.startDate || exp.start_date, locale);
        const isPresent = exp.is_present || false;
        const endValue = isPresent
          ? presentLabel
          : exp.endDate || exp.end_date
            ? formatDate(exp.endDate || exp.end_date, locale)
            : start
            ? presentLabel
            : "";

        return {
          title: exp.position || exp.title || "",
          company: exp.company || "",
          location: exp.location || "",
          start,
          end: endValue,
          summary: exp.summary || "",
          bullets: splitDescription(exp.description || exp.details || ""),
        };
      })
    : [];

  const education = Array.isArray(data.educations)
    ? data.educations.map((edu) => ({
        degree: edu.degree || "",
        school: edu.institution || edu.school || "",
        location: edu.location || "",
        graduated: edu.is_present
          ? presentLabel
          : edu.end_date
          ? new Date(edu.end_date).getFullYear().toString()
          : "",
        details: edu.description || "",
      }))
    : [];

  const skills = Array.isArray(data.skills)
    ? data.skills
        .map((skill) => {
          if (typeof skill === "string") return skill;
          if (!skill || !skill.name) return null;
          return skill.proficiency
            ? `${skill.name} (${skill.proficiency})`
            : skill.name;
        })
        .filter(Boolean)
    : [];

  const certifications = Array.isArray(data.certificates)
    ? data.certificates
        .map((cert) => {
          if (typeof cert === "string") return cert;
          if (!cert || !cert.name) return null;
          const label = [cert.name, cert.issuer].filter(Boolean).join(" — ");
          const dateLabel = cert.date_obtained
            ? formatDate(cert.date_obtained, locale)
            : "";
          return dateLabel ? `${label} (${dateLabel})` : label;
        })
        .filter(Boolean)
    : [];

  const interests = Array.isArray(data.hobbies || data.interests)
    ? (data.hobbies || data.interests)
        .map((item) => {
          if (typeof item === "string") return item;
          if (!item || !item.name) return null;
          return item.name;
        })
        .filter(Boolean)
    : [];

  const languages = Array.isArray(data.languages)
    ? data.languages
        .map((lang) => {
          if (typeof lang === "string") return lang;
          if (!lang || !lang.language) return null;
          return lang.proficiency
            ? `${lang.language} (${lang.proficiency})`
            : lang.language;
        })
        .filter(Boolean)
    : [];

  const projects = Array.isArray(data.projects)
    ? data.projects.map((project) => {
        const start = formatDate(project.startDate || project.start_date, locale);
        const endValue =
          project.endDate || project.end_date
            ? formatDate(project.endDate || project.end_date, locale)
            : start
            ? presentLabel
            : "";

        return {
          name: project.name || "",
          description: project.description || "",
          technologies: project.technologies || "",
          url: project.url || "",
          start,
          end: endValue,
          bullets: splitDescription(project.description || ""),
        };
      })
    : [];

  return {
    name: data.full_name || data.name || "",
    tagline: data.job_title || data.tagline || "",
    template_layout: templateLayout,
    template_id: templateId,
    contact,
    summary: data.professional_summary || data.summary || "",
    experience,
    education,
    skills,
    certifications,
    interests,
    languages,
    projects,
    section_order: data.section_order || null,
  };
};

