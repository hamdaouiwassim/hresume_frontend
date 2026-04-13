import { useContext, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import {
  Building2,
  Briefcase,
  Globe,
  Linkedin,
  Phone,
  Shield,
  UserCheck,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { register } from "../services/authService";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";

const companySizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const steps = [
  { title: "Your account", description: "Personal credentials" },
  { title: "Company details", description: "Hiring context" },
  { title: "Compliance", description: "Data guarantees" },
];

export default function RecruiterRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    company_size: "",
    industry_focus: "",
    hiring_focus: "",
    recruiter_role: "",
    recruiter_phone: "",
    recruiter_linkedin: "",
    compliance_accepted: false,
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  if (user?.email_verified_at && user?.is_recruiter) {
    return <Navigate to="/recruiter/resumes" replace />;
  }
  if (user) {
    return <Navigate to="/resumes" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const stepValidations = useMemo(
    () => [
      () => {
        const stepErrors = {};
        if (!formData.name.trim()) stepErrors.name = ["Name is required"];
        if (!formData.email.trim()) stepErrors.email = ["Work email is required"];
        if (!formData.password || formData.password.length < 8) {
          stepErrors.password = ["Password must be at least 8 characters"];
        }
        if (formData.password !== formData.password_confirmation) {
          stepErrors.password_confirmation = ["Passwords do not match"];
        }
        return stepErrors;
      },
      () => {
        const stepErrors = {};
        if (!formData.company_name.trim())
          stepErrors.company_name = ["Company name is required"];
        if (!formData.industry_focus.trim())
          stepErrors.industry_focus = ["Industry focus is required"];
        return stepErrors;
      },
      () => {
        const stepErrors = {};
        if (!formData.compliance_accepted)
          stepErrors.compliance_accepted = [
            "Please confirm you comply with data policies",
          ];
        return stepErrors;
      },
    ],
    [formData]
  );

  const handleNext = () => {
    const stepErrors = stepValidations[currentStep]();
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = stepValidations[currentStep]();
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await register({
        ...formData,
        account_type: "recruiter",
      });
      const registeredUser = response.data.user;
      const token = response.data.token;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      localStorage.setItem("user", JSON.stringify(registeredUser));
      setUser(registeredUser);

      toast.success(
        "Please verify your email. We'll notify you once an admin activates your recruiter access."
      );
      navigate("/resumes", { replace: true });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(
        error.response?.data?.message || "Unable to create recruiter account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Alex Johnson"
                />
                {errors.name && (
                  <p className="text-sm text-rose-500 mt-1">{errors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Work email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-rose-500 mt-1">{errors.email[0]}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Create a secure password"
                />
                {errors.password && (
                  <p className="text-sm text-rose-500 mt-1">{errors.password[0]}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  Confirm password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Re-enter password"
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-rose-500 mt-1">
                    {errors.password_confirmation[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Company name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Acme Corporation"
                />
                {errors.company_name && (
                  <p className="text-sm text-rose-500 mt-1">
                    {errors.company_name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  Company size
                </label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="">Select a size</option>
                  {companySizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Industry focus
                </label>
                <input
                  type="text"
                  name="industry_focus"
                  value={formData.industry_focus}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Fintech, Healthtech..."
                />
                {errors.industry_focus && (
                  <p className="text-sm text-rose-500 mt-1">
                    {errors.industry_focus[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  Hiring focus / open roles
                </label>
                <input
                  type="text"
                  name="hiring_focus"
                  value={formData.hiring_focus}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Design, Engineering, Sales..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  Your role
                </label>
                <input
                  type="text"
                  name="recruiter_role"
                  value={formData.recruiter_role}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Talent Lead, HRBP..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  Phone (optional)
                </label>
                <input
                  type="text"
                  name="recruiter_phone"
                  value={formData.recruiter_phone}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-slate-400" />
                LinkedIn (optional)
              </label>
              <input
                type="url"
                name="recruiter_linkedin"
                value={formData.recruiter_linkedin}
                onChange={handleChange}
                className={inputClasses}
                placeholder="https://linkedin.com/in/you"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex gap-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div className="text-sm text-slate-600 text-left">
                <p className="font-semibold text-slate-900 mb-1">
                  Data & privacy confirmation
                </p>
                <p>
                  Confirm that you will only use candidate data for legitimate hiring purposes
                  and comply with GDPR/CCPA requirements. Temporary access can be revoked otherwise.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                name="compliance_accepted"
                checked={formData.compliance_accepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                I confirm that I comply with company security standards and only share candidate
                data with authorized team members.
              </span>
            </label>
            {errors.compliance_accepted && (
              <p className="text-sm text-rose-500">{errors.compliance_accepted[0]}</p>
            )}
            <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-2">Before you submit</p>
              <ul className="space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                  Double-check your work email—it’s where we’ll contact you.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                  Keep your company info current; admins rely on it for approval.
                </li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Candidate signup
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white flex flex-col gap-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                    Recruiter Program
                  </p>
                  <h1 className="text-3xl font-bold mt-3 leading-tight">
                    Activate your Recruiter Hub access
                  </h1>
                  <p className="mt-3 text-white/80 text-sm">
                    Request secure access to browse resumes, collaborate with hiring managers,
                    and submit template ideas directly from the platform.
                  </p>
                </div>
                <div className="space-y-4 text-white/90 text-sm">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-white" />
                    <p>Data sharing compliant with GDPR & CCPA</p>
                  </div>
                  <div className="flex gap-3">
                    <Briefcase className="h-5 w-5 text-white" />
                    <p>Unlimited recruiter seats inside your company</p>
                  </div>
                  <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-white" />
                    <p>Global resume coverage with live filtering</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    Progress
                  </p>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={step.title} className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-2xl flex items-center justify-center text-sm font-semibold ${
                            index < currentStep
                              ? "bg-white text-blue-600"
                              : index === currentStep
                              ? "bg-white/90 text-blue-600 border border-white/40"
                              : "bg-white/20 text-white/60"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{step.title}</p>
                          <p className="text-xs text-white/70">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 p-8">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {steps[currentStep].description}
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {renderStep()}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    {currentStep < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
                      >
                        Next step
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60"
                      >
                        {isSubmitting ? "Submitting..." : "Request recruiter access"}
                      </button>
                    )}
                  </div>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

