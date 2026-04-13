import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import { UserCheck, Lock, ArrowLeft, Chrome, Loader2 } from "lucide-react";
import { login, getGoogleAuthUrl } from "../services/authService";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
    
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const getHomePath = (currentUser) => {
    if (currentUser?.is_admin) return "/admin";
    if (currentUser?.is_recruiter && currentUser?.recruiter_status === "approved")
      return "/recruiter/resumes";
    if (currentUser?.recruiter_status && currentUser.recruiter_status !== "approved")
      return "/403";
    return "/resumes";
  };

  if (user) return <Navigate to={getHomePath(user)} />;
  const handleSubmit = async (e) => {
   
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(formData);
      const loggedInUser = res.data.user;
      const token = res.data.token;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setFormData({
        email: "",
        password: "",
      });

      if (res.data.requires_email_verification) {
        toast.info("Please verify your email to continue.");
      }

      toast.success("Login successful!");
      const destination = getHomePath(loggedInUser);
      navigate(destination);
    } catch (error) {
      if (error.response && error.response.data &&  error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(
        error.response?.data?.message || "❌ Verify your credentials"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await getGoogleAuthUrl();
      const redirectUrl = response.data?.url;
      if (!redirectUrl) {
        throw new Error("Missing redirect URL");
      }
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Google sign-in is temporarily unavailable."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <GuestLayout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
          {/* Back to Home Link */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {errors.email[0]}
                    </p>
                  )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-[0.3em]">
              <span className="px-3 bg-white text-slate-400">
                Seamless access
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="mt-4 w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 px-4 shadow-sm hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 disabled:opacity-60"
          >
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-white via-red-50 to-rose-100 border border-rose-100 flex items-center justify-center">
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
              ) : (
                <Chrome className="h-5 w-5 text-rose-500" />
              )}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                Continue with Google
              </p>
              <p className="text-xs text-slate-500">
                Use your professional Gmail in seconds
              </p>
            </div>
          </button>
        </div>
      </div>
    </GuestLayout>
  );
}
