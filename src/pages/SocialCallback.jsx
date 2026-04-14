import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { exchangeSocialAuthCode } from "../services/authService";
import { toast } from "sonner";
import { Loader2, ShieldCheck, AlertCircle, Home } from "lucide-react";

const getHomePath = (currentUser) => {
  if (currentUser?.is_admin) return "/admin";
  if (
    currentUser?.is_recruiter &&
    currentUser?.recruiter_status === "approved"
  )
    return "/recruiter/resumes";
  if (
    currentUser?.recruiter_status &&
    currentUser.recruiter_status !== "approved"
  )
    return "/403";
  return "/resumes";
};

export default function SocialCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Connecting to your account...");

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  useEffect(() => {
    const handleSocialLogin = async () => {
      const statusParam = query.get("status");
      const provider = query.get("provider") || "google";
      const errorMessage = query.get("message");
      const code = query.get("code");

      if (statusParam !== "success") {
        setStatus("error");
        setMessage(
          errorMessage ||
            `We could not verify your ${provider} session.`
        );
        return;
      }

      try {
        let profile = null;
        let token = null;

        if (code) {
            const exchangeResponse = await exchangeSocialAuthCode(code);
            profile = exchangeResponse.data?.user;
            token = exchangeResponse.data?.token || null;
        } else {
            const meResponse = await axiosInstance.get("/me");
            profile = meResponse.data?.user;
        }

        if (!profile) {
          throw new Error("Unable to fetch profile");
        }

        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);

        if (!profile.email_verified_at) {
          toast.info("Please verify your email to continue.");
        } else {
          toast.success("Signed in with Google");
        }
        navigate(getHomePath(profile), { replace: true });
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Something went wrong while finalizing your login. Please try again."
        );
      }
    };

    handleSocialLogin();
  }, [navigate, query, setUser]);

  if (status === "processing") {
    return (
      <GuestLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-3xl p-10 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Signing you in
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Please hold tight
            </h1>
            <p className="text-slate-600">{message}</p>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-3xl p-10 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Social login error
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            We couldn’t finish signing in
          </h1>
          <p className="text-slate-600">{message}</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white py-3 font-semibold"
            >
              <ShieldCheck className="h-5 w-5" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Home className="h-5 w-5" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
