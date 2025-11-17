import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Sparkles } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-lg border border-white/60 shadow-2xl rounded-3xl p-10 space-y-8 text-center">
        <div className="flex items-center justify-center">
          <div className="h-20 w-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg">
            <ShieldAlert className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Access restricted
          </p>
          <h1 className="text-4xl font-bold text-slate-900">Account not approved yet</h1>
          <p className="text-slate-600 text-lg">
            Your recruiter workspace is still waiting for admin activation. Please check back once
            your request has been reviewed. You can still manage your own resumes in the meantime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/resumes"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my workspace
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition"
          >
            <Sparkles className="h-4 w-4" />
            Contact support
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          Need faster approval? Email{" "}
          <a href="mailto:support@cvbuilder.app" className="text-sky-600 font-semibold">
            support@cvbuilder.app
          </a>
        </p>
      </div>
    </div>
  );
}

