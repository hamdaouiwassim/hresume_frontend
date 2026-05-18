import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import { usePageSeo } from '../hooks/usePageSeo';
import ApplicationSuiteSection from '../components/ApplicationSuiteSection';

const PRODUCT_CONFIG = {
  coverLetter: {
    canonicalPath: '/cover-letter-builder',
    appPath: '/cover-letters',
    registerNext: '/cover-letters',
    otherProductHref: '/work-certificate',
    otherProductKey: 'workCertificate',
  },
  workCertificate: {
    canonicalPath: '/work-certificate',
    appPath: '/work-certificates',
    registerNext: '/work-certificates',
    otherProductHref: '/cover-letter-builder',
    otherProductKey: 'coverLetter',
  },
};

export default function ProductMarketingPage({ product }) {
  const { t } = useLanguage();
  const config = PRODUCT_CONFIG[product];
  const content = t?.productLanding?.[product] || {};
  const other = t?.productLanding?.[config.otherProductKey] || {};
  const common = t?.productLanding?.common || {};

  usePageSeo({
    title: content.metaTitle || 'HResume',
    description: content.metaDescription || '',
    canonicalPath: config.canonicalPath,
  });

  const registerUrl = `/register?next=${encodeURIComponent(config.registerNext)}`;
  const bullets = content.bullets || [];

  return (
    <GuestLayout>
      <article className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12">
          <header className="text-center space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
              {content.badge || 'HResume'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              {content.title}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {content.subtitle}
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">{content.accountNote}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={registerUrl}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
              >
                {content.primaryCta || common.primaryCta || 'Create free account'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                {content.secondaryCta || common.secondaryCta || 'Log in'}
              </Link>
            </div>
          </header>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {content.featuresTitle || 'What you get'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bullets.map((text) => (
                <li key={text} className="flex gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {content.bodyParagraphs?.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
              {paragraph}
            </p>
          ))}

          <section className="text-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
            <p className="text-sm text-slate-600 mb-3">{common.alsoTry}</p>
            <Link
              to={config.otherProductHref}
              className="font-semibold text-blue-600 hover:text-purple-700 hover:underline"
            >
              {other.shortTitle || config.otherProductKey}
            </Link>
            <span className="text-slate-400 mx-2">·</span>
            <Link to="/" className="font-semibold text-blue-600 hover:text-purple-700 hover:underline">
              {common.backHome || 'Back to homepage'}
            </Link>
          </section>

          <ApplicationSuiteSection />
        </div>
      </article>
    </GuestLayout>
  );
}
