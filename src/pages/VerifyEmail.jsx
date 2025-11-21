import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import { MailCheck, RefreshCw, ShieldCheck, LogOut } from "lucide-react";
import { resendVerificationEmail, logout } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const targetEmail = useMemo(() => {
    return location.state?.email || user?.email || "";
  }, [location.state, user]);

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate(user?.is_admin ? "/admin" : "/resumes", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user) {
      toast.info("Please log in again to resend the verification email.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsSending(true);
      await resendVerificationEmail();
      toast.success("Verification link sent! Check your inbox.");
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resend verification email.");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      localStorage.clear();
      setUser(null);
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local storage and redirect
      localStorage.clear();
      setUser(null);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 space-y-8 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MailCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Verify your email
              </p>
              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                Confirm your email address
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-600 text-lg">
              We sent a verification link to{" "}
              <span className="font-semibold text-slate-900">{targetEmail || "your inbox"}</span>.
              Click the link in that email to unlock your dashboard.
            </p>
            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">Didn't receive the email?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your spam or promotions folder.</li>
                <li>Make sure {targetEmail || "your email"} is typed correctly.</li>
                <li>It can take up to a few minutes for the email to arrive.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Resend verification email
                </>
              )}
            </button>
            {cooldown > 0 && (
              <p className="text-sm text-center text-slate-500">
                You can send another email in {cooldown}s.
              </p>
            )}
            
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 text-slate-700 py-3 font-semibold hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Logout
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex gap-3 text-sm text-emerald-800">
            <ShieldCheck className="h-5 w-5 mt-0.5" />
            <p>
              Once your email is verified, recruiters will still need admin approval before accessing
              the recruiter hub. We'll notify you as soon as your workspace is ready.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500">
            Need help?{" "}
            <a href="mailto:support@cvbuilder.app" className="font-semibold text-blue-600">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </GuestLayout>
  );
}

