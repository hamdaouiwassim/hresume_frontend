import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { usePricingRegion } from '../hooks/usePricingRegion';
import { createCheckoutSession } from '../services/billingService';
import { BadgeDollarSign, CheckCircle2, Shield, Loader2, Crown, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Pricing() {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const pricing = t?.pricing || {};
  const { loading, freePrice, proPrice, isTunisia, region } = usePricingRegion();
  const freePlan = pricing.freePlan || pricing.plan || {};
  const proPlan = pricing.proPlan || {};
  const freeFeatures = freePlan.features || [];
  const proFeatures = proPlan.features || [];
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const regionNote = isTunisia
    ? pricing.regionNoteTunisia
    : pricing.regionNoteInternational;

  const handleUpgrade = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent('/pricing')}`);
      return;
    }

    if (user.is_pro) {
      return;
    }

    if (isTunisia || region === 'tunisia') {
      toast.info(
        proPlan.tunisiaUpgradeNote ||
          'Online checkout is for international customers. Contact us for Pro in Tunisia.'
      );
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await createCheckoutSession(region);
      const url = response?.data?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error(proPlan.checkoutError || 'Could not start checkout.');
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message;
      if (code === 'tunisia_checkout_unavailable') {
        toast.info(proPlan.tunisiaUpgradeNote || message);
      } else if (code === 'billing_not_configured') {
        toast.error(proPlan.billingUnavailable || message);
      } else if (code === 'already_pro') {
        toast.info(proPlan.alreadyPro || message);
      } else {
        toast.error(message || proPlan.checkoutError || 'Checkout failed.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const proCta = () => {
    if (user?.is_pro) {
      return (
        <span className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-indigo-700 bg-white/90 cursor-default">
          <Crown className="h-4 w-4 mr-2" />
          {proPlan.alreadyPro || 'You are on Pro'}
        </span>
      );
    }

    if (!user) {
      return (
        <Link
          to={`/login?next=${encodeURIComponent('/pricing')}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-indigo-700 bg-white hover:bg-slate-100 transition"
        >
          {proPlan.loginToUpgrade || 'Sign in to upgrade'}
        </Link>
      );
    }

    if (isTunisia) {
      return (
        <Link
          to="/contact"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-indigo-700 bg-white hover:bg-slate-100 transition"
        >
          <Mail className="h-4 w-4 mr-2" />
          {proPlan.tunisiaContactCta || 'Contact us for Pro'}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={checkoutLoading}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-indigo-700 bg-white hover:bg-slate-100 transition disabled:opacity-70"
      >
        {checkoutLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {checkoutLoading
          ? proPlan.buttonLoading || 'Redirecting to checkout…'
          : proPlan.button || 'Upgrade to Pro'}
      </button>
    );
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
              <BadgeDollarSign className="h-4 w-4" />
              {pricing.badge || 'Simple Plans'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              {pricing.title || 'Transparent Pricing'}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              {pricing.subtitle ||
                'Choose the plan that matches your goals. Upgrade to Pro to unlock AI enhancement features.'}
            </p>
            {regionNote && !loading && (
              <p className="text-sm text-slate-500 max-w-xl mx-auto">{regionNote}</p>
            )}
            {isTunisia && !loading && (
              <p className="text-sm text-amber-700 max-w-xl mx-auto">
                {proPlan.tunisiaUpgradeNote ||
                  'Pro checkout online is for international customers. Tunisia: contact support.'}
              </p>
            )}
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                {pricing.heroCta || 'Create Free Account'}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-500 mb-3">
                    {freePlan.name || 'HResume Free'}
                  </p>
                  <div className="flex items-baseline gap-2 min-h-[3.5rem]">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-slate-900">{freePrice}</span>
                        <span className="text-slate-500 font-medium">
                          {freePlan.per || 'per month'}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-600 mt-3">
                    {freePlan.description ||
                      'Build one resume and try AI with monthly limits.'}
                  </p>
                </div>
                <Link
                  to={user ? '/resume/create' : '/resume/start'}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-blue-600 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  {freePlan.button || 'Start for Free'}
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {freeFeatures.map((feature, idx) => (
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

            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white border border-indigo-400">
              <div className="flex flex-col gap-5 mb-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-100 mb-3">
                    {proPlan.name || 'HResume Pro'}
                  </p>
                  <div className="flex items-baseline gap-2 min-h-[3.5rem]">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
                    ) : (
                      <>
                        <span className="text-5xl font-bold">{proPrice}</span>
                        <span className="text-blue-100 font-medium">
                          {proPlan.per || 'per month'}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-blue-50 mt-3">
                    {proPlan.description ||
                      'Unlock unlimited resumes and AI for an active job search.'}
                  </p>
                </div>
                {proCta()}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {proFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-white/20 bg-white/10"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <p className="text-white">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {pricing.note?.title || 'Why Pro?'}
              </h2>
              <p className="text-slate-700">
                {pricing.note?.description ||
                  'Free is built for one strong CV and a monthly taste of AI. Pro is for active job searches.'}
              </p>
              <p className="text-sm text-slate-600 mt-3">
                <Link to="/refund" className="text-blue-600 font-semibold hover:underline">
                  {pricing.note?.refundLink || 'Refund policy'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
