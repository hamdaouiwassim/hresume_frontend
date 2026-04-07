import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import GuestLayout from "../Layouts/GuestLayout";
import ResumeTemplatePreview from "../components/ResumeTemplatePreview";
import { getTemplates } from "../services/resumeService";
import { deriveTemplateLayout, TEMPLATE_LAYOUTS } from "../utils/templateStyles";

const SAMPLE_RESUME = {
  name: "Alex Morgan",
  tagline: "Senior Product Manager",
  contact: {
    location: "Paris, France",
    email: "alex.morgan@email.com",
    phone: "+33 6 12 34 56 78",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
    website: "alexmorgan.dev",
    profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex-morgan",
  },
  summary:
    "Product leader with 8+ years of experience delivering B2B SaaS platforms. Strong track record in cross-functional execution, roadmap prioritization, and measurable business impact.",
  experience: [
    {
      title: "Senior Product Manager",
      company: "NovaTech",
      location: "Paris, France",
      start: "Jan 2022",
      end: "Present",
      bullets: [
        "Led platform redesign that increased activation by 27%.",
        "Aligned engineering and design squads across 3 product lines.",
      ],
    },
    {
      title: "Product Manager",
      company: "Bright Labs",
      location: "Lyon, France",
      start: "May 2019",
      end: "Dec 2021",
      bullets: [
        "Shipped self-serve onboarding and reduced churn by 14%.",
        "Introduced product analytics framework used by leadership.",
      ],
    },
  ],
  education: [
    {
      degree: "MSc in Management",
      school: "ESSEC Business School",
      location: "Cergy, France",
      graduated: "2018",
    },
  ],
  skills: [
    "Product strategy",
    "Roadmapping",
    "A/B testing",
    "Stakeholder management",
    "SQL & Analytics",
  ],
  certifications: ["PSPO I", "Google Analytics Certified"],
  languages: ["English (Fluent)", "French (Native)"],
  interests: ["Mentoring", "Trail running", "Photography"],
  hobbies: ["Mentoring", "Trail running", "Photography"],
  projects: [
    {
      name: "Lifecycle Optimization Program",
      description: "Cross-team initiative focused on trial-to-paid conversion.",
      technologies: "Amplitude, HubSpot, Segment",
      start: "2023",
      end: "2024",
      bullets: ["Improved conversion rate by 19% over two quarters."],
    },
  ],
  section_order: [
    "personal",
    "socialMedia",
    "experience",
    "education",
    "skills",
    "projects",
    "languages",
    "hobbies",
    "certifications",
  ],
  typography: {
    font_family: "sans-serif",
    font_size: 14,
  },
};

export default function TemplatePreviewPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await getTemplates();
        const templates = response?.data?.data || [];
        const selected = templates.find((item) => String(item.id) === String(id));
        setTemplate(selected || null);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const templateLayout = useMemo(() => {
    if (!template) return TEMPLATE_LAYOUTS.CLASSIC;
    return deriveTemplateLayout(template);
  }, [template]);

  const previewResume = useMemo(
    () => ({
      ...SAMPLE_RESUME,
      template_id: template?.id || null,
      template_layout: templateLayout,
    }),
    [template, templateLayout]
  );

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/templates/public" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : !template ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Template not found</h1>
              <p className="text-gray-600">The requested template preview does not exist.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">{template.name} Preview</h1>
                <p className="text-gray-600 mt-2">{template.description || "Preview with sample data."}</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-gray-100">
                <ResumeTemplatePreview resume={previewResume} templateKey={templateLayout} />
              </div>
            </>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
