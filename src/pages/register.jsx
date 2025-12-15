import { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import GuestLayout from "../Layouts/GuestLayout";
import { UserCheck, Lock, Mail, ArrowLeft, Loader2, Chrome } from 'lucide-react';
import { register, getGoogleAuthUrl } from '../services/authService';
import { toast } from 'sonner';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const { user, setUser } = useContext(AuthContext);

  if (user) return <Navigate to="/resumes" replace />;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await register(formData);
      const newUser = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser({ token, ...newUser });

      toast.success("Account created! Please verify your email to continue.");

      navigate('/resumes', { replace: true });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || "❌ Can't create your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
        error.response?.data?.message || "Google sign-up is temporarily unavailable."
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
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
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
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {errors.email[0]}
                    </p>
                  )}
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600" id="email-error">
                      {errors.password[0]}
                    </p>
                  )}
                
              </div>

              <div>
                <label htmlFor="password_confirmation" className="sr-only">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-[0.3em]">
                <span className="px-3 bg-white text-gray-400">Instant onboarding</span>
              </div>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 px-4 shadow-sm hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 disabled:opacity-60"
            >
              <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-white via-red-50 to-rose-100 border border-rose-100 flex items-center justify-center">
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
                ) : (
                  <Chrome className="h-5 w-5 text-rose-500" />
                )}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Sign up with Google</p>
                <p className="text-xs text-slate-500">Create your recruiter-ready account in one tap</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}