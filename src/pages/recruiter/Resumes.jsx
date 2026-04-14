import { useEffect, useState } from "react";
import RecruiterLayout from "../../Layouts/RecruiterLayout";
import { fetchRecruiterResumes, fetchRecruiterResume } from "../../services/recruiterService";
import { getTemplates } from "../../services/resumeService";
import { Search, Filter, Loader2, Calendar, FileText, Mail, X, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function RecruiterResumes() {
  const [resumes, setResumes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    template_id: "",
    from_date: "",
    to_date: "",
    page: 1,
    per_page: 12,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadResumes();
  }, [filters.page, filters.per_page]);

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      if (response.data.status) {
        setTemplates(response.data.data || response.data.templates || []);
      }
    } catch (error) {
    }
  };

  const loadResumes = async (customFilters = filters) => {
    try {
      setIsLoading(true);
      const response = await fetchRecruiterResumes(customFilters);
      if (response.data.status) {
        setResumes(response.data.data.data || response.data.data || []);
        setPagination({
          current_page: response.data.data.current_page || 1,
          last_page: response.data.data.last_page || 1,
          total: response.data.data.total || 0,
        });
      } else {
        toast.error("Failed to load resumes");
      }
    } catch (error) {
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value, page: 1 };
    setFilters(updated);
    loadResumes(updated);
  };

  const handlePageChange = (direction) => {
    const nextPage =
      direction === "next"
        ? Math.min(pagination.current_page + 1, pagination.last_page)
        : Math.max(pagination.current_page - 1, 1);

    const updated = { ...filters, page: nextPage };
    setFilters(updated);
    loadResumes(updated);
  };

  const openResumeDetail = async (resumeId) => {
    try {
      setIsDetailLoading(true);
      setIsDetailOpen(true);
      const response = await fetchRecruiterResume(resumeId);
      if (response.data.status) {
        setSelectedResume(response.data.data);
      } else {
        toast.error("Failed to load resume");
      }
    } catch (error) {
      toast.error("Failed to load resume");
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <RecruiterLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold uppercase tracking-wide mb-3">
            Recruiter View
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">All Resumes</h1>
              <p className="text-slate-600">Explore talents and filter candidates instantly</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Filter className="h-4 w-4" />
              <span>Advanced filters powered by recruiters</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6 mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-xs uppercase font-semibold text-slate-500 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate name, email or resume title"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-slate-500 mb-2 block">
              Template
            </label>
            <select
              value={filters.template_id}
              onChange={(e) => handleFilterChange("template_id", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All templates</option>
              {templates.map((template) => (
                <option value={template.id} key={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500 mb-2 block">
                From
              </label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => handleFilterChange("from_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500 mb-2 block">
                To
              </label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => handleFilterChange("to_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-700">No resumes match filters</p>
              <p className="text-slate-500 text-sm">Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          resume.user?.avatar ||
                          "https://api.dicebear.com/7.x/initials/svg?seed=" + (resume.user?.name || "user")
                        }
                        alt={resume.user?.name}
                        className="h-12 w-12 rounded-2xl border border-slate-200"
                      />
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{resume.name}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {resume.user?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {resume.template?.name || "No template"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>
                          Updated {new Date(resume.updated_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <button
                        onClick={() => openResumeDetail(resume.id)}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                      >
                        View full resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resumes.length > 0 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 text-sm">
              <p className="text-slate-500">
                Showing {resumes.length} results · Page {pagination.current_page} of{" "}
                {pagination.last_page}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={pagination.current_page === 1}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDetailOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4"
          onClick={() => {
            setIsDetailOpen(false);
            setSelectedResume(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wide">
                  Resume overview
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {selectedResume?.name || "Resume"}
                </h3>
              </div>
              <button
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedResume(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <section className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase mb-2">
                    Candidate
                  </p>
                  <h4 className="text-xl font-semibold text-slate-900">
                    {selectedResume?.basic_info?.full_name || selectedResume?.user?.name}
                  </h4>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {selectedResume?.user?.email || "N/A"}
                    </div>
                    {selectedResume?.basic_info?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {selectedResume.basic_info.phone}
                      </div>
                    )}
                    {selectedResume?.basic_info?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {selectedResume.basic_info.location}
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h5 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                    Professional summary
                  </h5>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl">
                    {selectedResume?.basic_info?.summary || "No summary provided."}
                  </p>
                </section>

                <section>
                  <h5 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                    Experience
                  </h5>
                  {selectedResume?.experiences && selectedResume.experiences.length > 0 ? (
                    <div className="space-y-3">
                      {selectedResume.experiences.map((experience) => (
                        <div
                          key={experience.id}
                          className="border border-slate-100 rounded-2xl p-4"
                        >
                          <p className="text-base font-semibold text-slate-900">
                            {experience.position}
                          </p>
                          <p className="text-sm text-slate-500">{experience.company}</p>
                          <p className="text-xs uppercase text-slate-400 mt-1">
                            {experience.start_date} - {experience.end_date || "Present"}
                          </p>
                          <p className="text-sm text-slate-600 mt-2">{experience.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No experiences listed.</p>
                  )}
                </section>

                <section>
                  <h5 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                    Skills
                  </h5>
                  {selectedResume?.skills && selectedResume.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No skills listed.</p>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}

