import GuestLayout from "../Layouts/GuestLayout";
import { Link } from "react-router-dom";
import { ShieldCheck, Clock, Mail, ArrowLeft } from "lucide-react";

export default function TrackRequest() {
  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-white/70 shadow-2xl rounded-3xl p-10 space-y-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Recruiter access
            </p>
            <h1 className="text-4xl font-bold text-slate-900">
              Track your request status
            </h1>
            <p className="text-slate-600 text-lg">
              We’re verifying your recruiter profile. Keep an eye on your email —
              we’ll notify you as soon as an admin activates your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Current status</h3>
              <p className="text-sm text-slate-600">
                Pending review — most requests are approved within 1–2 business days.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <Mail className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-slate-900">Inbox updates</h3>
              <p className="text-sm text-slate-600">
                We’ll reach out to your work email if we need more context.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Need help?</h3>
              <p className="text-sm text-slate-600">
                Contact{" "}
                <a
                  href="mailto:support@cvbuilder.app"
                  className="font-semibold text-blue-600"
                >
                  support@cvbuilder.app
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 bg-white">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              While you wait
            </h3>
            <ul className="list-disc pl-5 text-slate-600 space-y-1 text-sm">
              <li>Log in to manage your personal resumes</li>
              <li>
                Prepare a shortlist of roles you’re hiring for — it helps admins prioritize
              </li>
              <li>Invite your hiring partners once you receive the approval email</li>
            </ul>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

