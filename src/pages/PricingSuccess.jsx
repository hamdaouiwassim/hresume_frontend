import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { confirmCheckoutSession } from '../services/billingService';
import axiosInstance from '../api/axiosInstance';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function PricingSuccess() {
  const { t } = useLanguage();
  const { user, setUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const strings = t?.pricing?.success || {};
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (!user) {
      setStatus('unauthenticated');
      return;
    }

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('missing_session');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await confirmCheckoutSession(sessionId);
        const me = await axiosInstance.get('/me');
        if (!cancelled) {
          setUser(me.data.user);
          setStatus('success');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, searchParams, setUser]);

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 py-20">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          {status === 'pending' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-slate-600">{strings.pending || 'Confirming your payment…'}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
              <h1 className="text-3xl font-bold text-slate-900">
                {strings.title || 'Welcome to Pro!'}
              </h1>
              <p className="text-slate-600">
                {strings.subtitle ||
                  'Your subscription is active. Unlimited resumes and AI are now unlocked.'}
              </p>
              <Link
                to="/resumes"
                className="inline-flex px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {strings.goToResumes || 'Go to my resumes'}
              </Link>
            </>
          )}

          {(status === 'error' || status === 'missing_session') && (
            <>
              <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
              <p className="text-slate-700">
                {strings.error ||
                  'We could not confirm your payment. If you were charged, contact support.'}
              </p>
              <Link to="/pricing" className="text-blue-600 font-semibold hover:underline">
                {strings.goToPricing || 'Back to pricing'}
              </Link>
            </>
          )}

          {status === 'unauthenticated' && (
            <>
              <p className="text-slate-600">Please sign in to complete your upgrade.</p>
              <Link
                to={`/login?next=${encodeURIComponent('/pricing/success' + window.location.search)}`}
                className="inline-flex px-8 py-3 rounded-xl font-semibold text-white bg-blue-600"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
