import { useContext } from "react";
import AuthLayout from "../../Layouts/AuthLayout";
import { Clock, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { Link, Navigate } from "react-router-dom";

export default function PendingActivation() {
  const { user } = useContext(AuthContext);

  if (user && user.recruiter_status !== "pending") {
    return <Navigate to={user.is_recruiter ? "/recruiter/resumes" : "/resumes"} />;
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Recruiter Access
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">
                  Your recruiter account is pending approval
                </h1>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-lg">
              Thanks for submitting your recruiter profile. Our admin team is
              reviewing your information. Once your account is activated, you
              will be able to access the Recruiter Hub, browse resumes, and
              submit template proposals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <div className="flex items-center gap-3 text-slate-900 font-semibold mb-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  What happens next?
                </div>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Admin validates company and compliance details</li>
                  <li>• You receive an email notification once approved</li>
                  <li>• Recruiter Hub link will turn on automatically</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-blue-50/60 p-5">
                <div className="flex items-center gap-3 text-slate-900 font-semibold mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Need help?
                </div>
                <p className="text-sm text-slate-600">
                  Contact our team at{" "}
                  <a
                    href="mailto:support@cvbuilder.app"
                    className="font-semibold text-blue-600"
                  >
                    support@cvbuilder.app
                  </a>{" "}
                  if you have urgent timelines or updates to share.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                Your submission
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div>
                  <p className="text-slate-500 text-xs uppercase">Name</p>
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Company</p>
                  <p className="font-semibold text-slate-900">
                    {user?.company_name || "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Industry</p>
                  <p className="font-semibold text-slate-900">
                    {user?.industry_focus || "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">
                    Recruiter Status
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    Pending review
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-slate-500">
                You still have access to your personal resume workspace while we
                finish verification.
              </p>
              <Link
                to="/resumes"
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to my workspace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

