import { useContext, useEffect, useMemo, useState } from "react";
import RecruiterLayout from "../../Layouts/RecruiterLayout";
import { AuthContext } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/profileService";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  RefreshCw,
  Building2,
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Sparkles,
  Save,
  Image as ImageIcon,
} from "lucide-react";

const companySizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const statusConfig = {
  pending: {
    label: "Pending review",
    badge: "bg-amber-100 text-amber-700",
    copy: "We're reviewing your recruiter profile. You'll gain access as soon as an admin approves your request.",
  },
  approved: {
    label: "Approved",
    badge: "bg-emerald-100 text-emerald-700",
    copy: "Your recruiter workspace is live. You can browse resumes and collaborate with hiring teams.",
  },
  revoked: {
    label: "Access revoked",
    badge: "bg-rose-100 text-rose-700",
    copy: "Please contact the admin team to regain access or update any required information below.",
  },
};

export default function RecruiterProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    recruiter_phone: "",
    recruiter_linkedin: "",
    company_name: "",
    company_size: "",
    industry_focus: "",
    hiring_focus: "",
    recruiter_role: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [brandPreview, setBrandPreview] = useState("");
  const [brandAvatarFile, setBrandAvatarFile] = useState(null);

  const statusDetails = useMemo(() => {
    const key = user?.recruiter_status || "pending";
    return statusConfig[key] || statusConfig.pending;
  }, [user?.recruiter_status]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getProfile();
      if (response.data.status) {
        const profile = response.data.user;
        setUser(profile);
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          recruiter_phone: profile.recruiter_phone || "",
          recruiter_linkedin: profile.recruiter_linkedin || "",
          company_name: profile.company_name || "",
          company_size: profile.company_size || "",
          industry_focus: profile.industry_focus || "",
          hiring_focus: profile.hiring_focus || "",
          recruiter_role: profile.recruiter_role || "",
        });
        setBrandPreview(profile.brand_avatar || "");
        setBrandAvatarFile(null);
        setIsDirty(false);
        setErrors({});
      }
    } catch (error) {
      toast.error("Failed to load recruiter profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (brandPreview && brandPreview.startsWith("blob:")) {
        URL.revokeObjectURL(brandPreview);
      }
    };
  }, [brandPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleBrandAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    if (brandPreview && brandPreview.startsWith("blob:")) {
      URL.revokeObjectURL(brandPreview);
    }

    setBrandPreview(URL.createObjectURL(file));
    setBrandAvatarFile(file);
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let payload;
      if (brandAvatarFile instanceof File) {
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            payload.append(key, value);
          }
        });
        payload.append("brand_avatar", brandAvatarFile, brandAvatarFile.name);
      } else {
        payload = { ...formData };
      }
      const response = await updateProfile(payload);
      if (response.data.status) {
        setUser(response.data.user);
        setBrandPreview(response.data.user.brand_avatar || "");
        setBrandAvatarFile(null);
        setIsDirty(false);
        toast.success("Profile updated");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Recruiter Profile
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">
              Company & contact information
            </h1>
            <p className="text-slate-500 mt-2">
              Keep your hiring details up to date so admins can validate your
              access quickly.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="inline-flex items-center px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              type="submit"
              form="recruiter-profile-form"
              disabled={isSaving || !isDirty}
              className={`inline-flex items-center px-5 py-2.5 rounded-2xl font-semibold shadow-lg transition ${
                isSaving || !isDirty
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Verification status
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 mt-2">
                    Recruiter workspace status
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusDetails.badge}`}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {statusDetails.label}
                </span>
              </div>
              <p className="text-slate-600">{statusDetails.copy}</p>
              {user?.recruiter_admin_notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900 mb-1">
                    Admin notes
                  </p>
                  <p>{user.recruiter_admin_notes}</p>
                </div>
              )}
            </div>

            <form
              id="recruiter-profile-form"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-sky-100 text-sky-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Contact information
                    </h3>
                    <p className="text-sm text-slate-500">
                      Used for login and notifications.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                      placeholder="Alex Johnson"
                    />
                    {errors.name && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.name[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Work email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                      placeholder="you@company.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.email[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Phone
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
                      <Phone className="h-4 w-4 text-slate-400 mr-2" />
                      <input
                        type="text"
                        name="recruiter_phone"
                        value={formData.recruiter_phone}
                        onChange={handleChange}
                        className="w-full bg-transparent py-3 focus:outline-none"
                        placeholder="+1 555 123 4567"
                      />
                    </div>
                    {errors.recruiter_phone && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.recruiter_phone[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      LinkedIn
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
                      <Linkedin className="h-4 w-4 text-slate-400 mr-2" />
                      <input
                        type="url"
                        name="recruiter_linkedin"
                        value={formData.recruiter_linkedin}
                        onChange={handleChange}
                        className="w-full bg-transparent py-3 focus:outline-none"
                        placeholder="https://linkedin.com/in/you"
                      />
                    </div>
                    {errors.recruiter_linkedin && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.recruiter_linkedin[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Company details
                    </h3>
                    <p className="text-sm text-slate-500">
                      Used by admins to verify your hiring team.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Company name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      placeholder="Acme Corporation"
                    />
                    {errors.company_name && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.company_name[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Company size
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="">Select a size</option>
                      {companySizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} employees
                        </option>
                      ))}
                    </select>
                    {errors.company_size && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.company_size[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Industry focus
                    </label>
                    <input
                      type="text"
                      name="industry_focus"
                      value={formData.industry_focus}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      placeholder="Fintech, Healthtech..."
                    />
                    {errors.industry_focus && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.industry_focus[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Hiring focus
                    </label>
                    <input
                      type="text"
                      name="hiring_focus"
                      value={formData.hiring_focus}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      placeholder="Engineering, Product, Sales..."
                    />
                    {errors.hiring_focus && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.hiring_focus[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Your role
                    </label>
                    <input
                      type="text"
                      name="recruiter_role"
                      value={formData.recruiter_role}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      placeholder="Talent Lead, HRBP..."
                    />
                    {errors.recruiter_role && (
                      <p className="text-sm text-rose-500 mt-1">
                        {errors.recruiter_role[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Workspace
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recruiter badge
                  </h3>
                </div>
              </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                      {brandPreview ? (
                        <img
                          src={brandPreview}
                          alt="Company brand"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                        Company logo
                      </p>
                      <label
                        htmlFor="brand-avatar"
                        className="text-sm font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                      >
                        Upload logo
                      </label>
                      <input
                        id="brand-avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleBrandAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      Recruiter
                    </p>
                    <p className="font-semibold text-slate-900">
                      {user?.name || "Your name"}
                    </p>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      Assigned company
                    </p>
                    <p className="text-slate-900 font-semibold">
                      {user?.company_name || "Pending"}
                    </p>
                  </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-green-100 text-green-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Data compliance
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your acknowledgement of candidate data policies.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                {user?.compliance_accepted ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    You confirmed GDPR/CCPA compliance
                  </div>
                ) : (
                  <p className="text-amber-600">
                    Please accept the compliance agreement during signup.
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-3">
                  Candidate data should only be used for legitimate hiring
                  purposes. Contact support if your compliance status changes.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Need faster approval?
                  </h3>
                  <p className="text-sm text-slate-500">
                    Email our team if your hiring deadline is near.
                  </p>
                </div>
              </div>
              <a
                href="mailto:support@cvbuilder.app"
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                support@cvbuilder.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}

