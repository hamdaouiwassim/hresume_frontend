import { useEffect, useState } from "react";
import RecruiterLayout from "../../Layouts/RecruiterLayout";
import { createTemplateProposal, getTemplateProposals } from "../../services/recruiterService";
import { toast } from "sonner";
import { FilePlus2, Loader2, CheckCircle2, AlertTriangle, Palette } from "lucide-react";

const categories = ["Corporate", "Creative", "Simple"];

export default function TemplateProposals() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: categories[0],
    preview_image_url: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      const response = await getTemplateProposals();
      if (response.data.status) {
        setProposals(response.data.data.data || response.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load proposals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await createTemplateProposal(form);
      if (response.data.status) {
        toast.success("Template proposal submitted!");
        setForm({
          name: "",
          description: "",
          category: categories[0],
          preview_image_url: "",
        });
        loadProposals();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <RecruiterLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-3">
            Templates Lab
          </p>
          <h1 className="text-4xl font-bold text-slate-900">Propose New Template</h1>
          <p className="text-slate-600">
            Share your creative template ideas. Once approved, they become available to everyone.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Template Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.name ? "border-rose-300 bg-rose-50" : "border-slate-200"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="e.g. Vibrant Recruiter Spotlight"
              />
              {errors.name && <p className="text-sm text-rose-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => handleChange("category", category)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                      form.category === category
                        ? "border-transparent bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Palette className="h-4 w-4 inline mr-2" />
                    {category}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-sm text-rose-500 mt-1">{errors.category[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Preview Image URL
              </label>
              <input
                type="url"
                value={form.preview_image_url}
                onChange={(e) => handleChange("preview_image_url", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.preview_image_url ? "border-rose-300 bg-rose-50" : "border-slate-200"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="https://example.com/preview.jpg"
              />
              {errors.preview_image_url && (
                <p className="text-sm text-rose-500 mt-1">{errors.preview_image_url[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.description ? "border-rose-300 bg-rose-50" : "border-slate-200"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Describe what makes this template special..."
              />
              {errors.description && (
                <p className="text-sm text-rose-500 mt-1">{errors.description[0]}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: "",
                    description: "",
                    category: categories[0],
                    preview_image_url: "",
                  })
                }
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/40 hover:from-indigo-600 hover:to-sky-600 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your submissions</h2>
              <p className="text-slate-500 text-sm">
                Track the review status for each of your template proposals.
              </p>
            </div>
          </div>

          {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                </div>
          ) : proposals.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-slate-700">
                    No proposals yet
                  </p>
                  <p className="text-slate-500 text-sm">
                    Submit your first template idea to kick things off.
                  </p>
                </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{proposal.name}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {proposal.description || "No description provided"}
                    </p>
                    <p className="text-xs uppercase font-semibold text-slate-400 mt-2">
                      {proposal.category}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end space-y-2">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        statusStyles[proposal.status] || statusStyles.pending
                      }`}
                    >
                      {proposal.status}
                    </span>
                    {proposal.status === "rejected" && proposal.admin_notes && (
                      <p className="text-xs text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {proposal.admin_notes}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(proposal.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}

