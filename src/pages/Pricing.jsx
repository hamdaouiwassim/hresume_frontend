import { Link } from "react-router-dom";
import GuestLayout from "../Layouts/GuestLayout";
import { useLanguage } from "../context/LanguageContext";
import { BadgeDollarSign, CheckCircle2, Sparkles, Shield } from "lucide-react";

export default function Pricing() {
  const { t } = useLanguage();
  const pricing = t?.pricing || {};
  const plan = pricing.plan || {};
  const planFeatures = plan.features || [
    "Unlimited resumes & templates",
    "One-click PDF export",
    "Live preview with translations",
    "Shareable public links",
    "Recruiter-friendly layouts",
  ];

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
              <BadgeDollarSign className="h-4 w-4" />
              {pricing.badge || "Free For Now"}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              {pricing.title || "Transparent Pricing"}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              {pricing.subtitle ||
                "All our services are 100% free right now. Build unlimited resumes, export polished PDFs, and share them without paying a cent."}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
            >
              {pricing.heroCta || "Create Free Account"}
            </Link>
          </div>

          {/* Plan Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-500 mb-3">
                  {plan.name || "HResume Free"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">
                    {plan.price || "$0"}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {plan.per || "per month"}
                  </span>
                </div>
                <p className="text-slate-600 mt-3">
                  {plan.description ||
                    "Access every feature while we remain in public beta. No credit card or hidden fees."}
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-blue-600 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition"
              >
                {plan.button || "Start for Free"}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {planFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Future Note */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {pricing.note?.title || "Future pricing?"}
              </h2>
              <p className="text-slate-700">
                {pricing.note?.description ||
                  "We may introduce premium add-ons for teams and recruiters later, but the core resume builder will stay free while we grow. You’ll receive plenty of notice before anything changes."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

