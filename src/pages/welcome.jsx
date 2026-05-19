
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import GuestLayout from "../Layouts/GuestLayout";
import { FileText, Layout, Rocket, CheckCircle, Award, ArrowRight, PlayCircle, Sparkles, Briefcase, Users, Eye, ShieldCheck, Star, BadgePercent, Lock, Wand2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReviewsCarousel from '../components/ReviewsCarousel';
import ApplicationSuiteSection from '../components/ApplicationSuiteSection';
import CountUpNumber from '../components/CountUpNumber';
import { getStats } from '../services/statsService';
import { getTemplates } from '../services/templateService';
import { prefetchEditorChunks } from '../utils/prefetchEditorChunks';
import config from '../config';
import './welcome.css';

function normalizeWalkthroughVideoUrl(url) {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.includes("youtube.com/embed/")) return u;
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return u;
}

export default function Welcome() {
  const { t } = useLanguage();
  const welcome = t?.welcome || {};
  const recruiterContent = t?.welcome?.recruiter || {};
  const recruiterCards = recruiterContent.cards || {};
  const trustStrings = t?.welcome?.trust || {};
  const suiteStrings = t?.welcome?.suite || {};
  const finalCta = t?.welcome?.finalCta || {};
  const featuresSubtitle = t?.welcome?.features?.subtitle;
  const walkthrough = welcome.walkthrough || {};
  const transformation = welcome.transformation || {};
  const trustProof = welcome.trustProof || {};
  const heroVariant = config.LANDING_HERO_VARIANT === "compact" ? "compact" : "default";
  const heroTitle =
    heroVariant === "compact" && welcome.heroTitleCompact
      ? welcome.heroTitleCompact
      : t.welcome.title;
  const heroSubtitle =
    heroVariant === "compact" && welcome.heroSubtitleCompact
      ? welcome.heroSubtitleCompact
      : t.welcome.subtitle;
  const resolvedWalkthroughVideo = useMemo(
    () => normalizeWalkthroughVideoUrl(config.WALKTHROUGH_VIDEO_URL || walkthrough.videoUrl || ""),
    [walkthrough.videoUrl, config.WALKTHROUGH_VIDEO_URL]
  );
  const [stats, setStats] = useState({ total_candidates: 0, total_resumes: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const statsSectionRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const transformationSectionRef = useRef(null);
  const transformationEnhanceTimeoutsRef = useRef([]);
  const [transformationInView, setTransformationInView] = useState(false);
  /** per example index: idle → user sees original text; enhancing → AI simulation on text; done → enhanced text */
  const [transformationPhase, setTransformationPhase] = useState({});
  const [transformationEnhancingIdx, setTransformationEnhancingIdx] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
  }, []);

  useEffect(() => {
    const runPrefetch = () => prefetchEditorChunks();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(runPrefetch, { timeout: 6000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(runPrefetch, 4000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStatsInView(true);
      setTransformationInView(true);
      return;
    }
    const el = statsSectionRef.current;
    if (!el) return;
    const statsObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsInView(true);
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );
    statsObs.observe(el);
    return () => statsObs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTransformationInView(true);
      return;
    }
    const el = transformationSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTransformationInView(true);
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = Math.min((transformation.examples || []).length, 2);
    if (n === 0) return;
    const initial = {};
    for (let i = 0; i < n; i += 1) initial[i] = "done";
    setTransformationPhase(initial);
  }, [transformation.examples?.length]);

  useEffect(() => {
    return () => {
      transformationEnhanceTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      transformationEnhanceTimeoutsRef.current = [];
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      if (response.data.status && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      if (response.data.status === 'success' && response.data.data) {
        setTemplates(response.data.data);
      }
    } catch (error) {
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  const handleTransformationEnhance = (idx) => {
    const phase = transformationPhase[idx] ?? "idle";
    if (phase !== "idle") return;
    if (transformationEnhancingIdx !== null) return;

    transformationEnhanceTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    transformationEnhanceTimeoutsRef.current = [];

    setTransformationEnhancingIdx(idx);

    const t1 = window.setTimeout(() => {
      setTransformationEnhancingIdx(null);
      setTransformationPhase((prev) => ({ ...prev, [idx]: "enhancing" }));
      const t2 = window.setTimeout(() => {
        setTransformationPhase((prev) => ({ ...prev, [idx]: "done" }));
      }, 1300);
      transformationEnhanceTimeoutsRef.current.push(t2);
    }, 520);
    transformationEnhanceTimeoutsRef.current.push(t1);
  };

  const wf = t?.welcome?.features || {};
  const featureCards = [
    { id: "easy", icon: FileText, grad: "from-blue-400 to-blue-600", title: wf.easy, desc: wf.easyDesc, ai: wf.easyAi },
    { id: "professional", icon: Layout, grad: "from-purple-400 to-purple-600", title: wf.professional, desc: wf.professionalDesc, ai: wf.professionalAi },
    { id: "ats", icon: Rocket, grad: "from-pink-400 to-pink-600", title: wf.ats, desc: wf.atsDesc, ai: wf.atsAi },
    { id: "export", icon: CheckCircle, grad: "from-green-400 to-green-600", title: wf.export, desc: wf.exportDesc, ai: wf.exportAi },
    { id: "multilingual", icon: Award, grad: "from-indigo-400 to-indigo-600", title: wf.multilingual, desc: wf.multilingualDesc, ai: wf.multilingualAi },
    {
      id: "smartAi",
      icon: Wand2,
      grad: "from-violet-500 to-fuchsia-600",
      title: wf.smartAiTitle,
      desc: wf.smartAiDesc,
      ai: wf.smartAiHint,
      highlight: true,
    },
  ];

  
  return (
    <GuestLayout navVariant="hero">
      <div className="relative min-h-screen">
        {/* Hero Section */}
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen hero-background">
          <div className="hero-decorations pointer-events-none" aria-hidden>
            <div className="floating-shape shape-1" />
            <div className="floating-shape shape-2" />
            <div className="floating-shape shape-3" />
          </div>
          {/* Overlay — keeps copy readable while showing the photo */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/75 via-indigo-950/65 to-purple-950/70" aria-hidden />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-wrap items-center justify-center">
              <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4 text-center lg:text-left">
                <div className="lg-pt-32 sm:pt-0 animate-slide-in pt-6">
                  {/* Sparkles decoration */}
                  <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                    <Sparkles className="h-6 w-6 text-violet-300 animate-pulse-slow" />
                    <span className="text-violet-200 font-semibold">
                      {t?.welcome?.heroBadge || "Professional CV Builder"}
                    </span>
                  </div>
                  
                  <h1
                    className={`font-bold leading-tight bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent text-center lg:text-left ${
                      heroVariant === "compact"
                        ? "text-4xl md:text-5xl lg:text-6xl"
                        : "text-5xl md:text-6xl lg:text-7xl"
                    }`}
                  >
                    {heroTitle}
                  </h1>
                  <p
                    className={`mt-4 leading-relaxed text-slate-200 text-center lg:text-left ${
                      heroVariant === "compact" ? "text-lg md:text-xl" : "text-xl lg:text-2xl"
                    }`}
                  >
                    {heroSubtitle}
                  </p>
                  {suiteStrings.heroLine && (
                    <p className="mt-3 text-sm sm:text-base text-slate-300/95 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                      {suiteStrings.heroLine}
                    </p>
                  )}
                  <p className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-1 gap-y-1 text-sm text-slate-300">
                    <Link to="/cover-letter-builder" className="font-medium text-violet-200 hover:text-white underline-offset-2 hover:underline">
                      {suiteStrings.coverLetter?.shortTitle || 'Cover letters'}
                    </Link>
                    <span className="text-slate-500" aria-hidden>·</span>
                    <Link to="/work-certificate" className="font-medium text-violet-200 hover:text-white underline-offset-2 hover:underline">
                      {suiteStrings.workCertificate?.shortTitle || 'Work certificates'}
                    </Link>
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 text-violet-100 px-4 py-2 text-sm font-semibold border border-white/20 backdrop-blur-sm mx-auto lg:mx-0">
                    <Sparkles className="h-4 w-4 text-violet-300" />
                    {welcome?.outcomePromise || "Get interview-ready CV in 60s"}
                  </div>
                  
                  {/* Enhanced CTA Buttons */}
                  <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link 
                      to="/register" 
                      onMouseEnter={prefetchEditorChunks}
                      className="cta-primary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {t.welcome.getStarted}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </Link>
                    <Link
                      to="/resume/start"
                      onMouseEnter={prefetchEditorChunks}
                      className="hero-cta-secondary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {t?.welcome?.guestStartCta || 'Start without an account'}
                    </Link>
                    {/* <Link
                      to="/register/recruiter"
                      className="cta-secondary inline-flex items-center px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-white text-slate-900"
                    >
                      <Briefcase className="h-5 w-5 mr-2" />
                      Recruiter signup
                    </Link> */}
                  </div>

                  {t.welcome.freeDescription && (
                    <p className="mt-3 text-sm text-slate-300 text-center lg:text-left">
                      {t.welcome.freeDescription}
                    </p>
                  )}
                  
                  {/* Trust indicators */}
                  <div className="mt-8 flex items-center gap-6 text-sm text-slate-300 mb-8 flex-wrap justify-center lg:justify-start">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span>{trustStrings.free || "Free to use"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span>{trustStrings.noCard || "No credit card"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span>{trustStrings.instant || "Instant download"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - After Hero */}
        <div
          ref={statsSectionRef}
          className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20 overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {isLoadingStats ? (
              <div className="flex items-center justify-center gap-12 sm:gap-16 md:gap-20 flex-wrap">
                <div className="text-center animate-pulse">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl mb-4 mx-auto"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-lg mb-3 mx-auto"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="text-center animate-pulse">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl mb-4 mx-auto"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-lg mb-3 mx-auto"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            ) : stats.total_candidates > 0 ? (
              <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 flex-wrap">
                {/* Candidates Stat */}
                <div className="group text-center transform transition-all duration-500 hover:scale-110">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 group-hover:blur-3xl transition-all duration-500 animate-pulse-slow"></div>
                    {/* Icon container */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500 transform group-hover:rotate-6">
                      <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white" />
                    </div>
                  </div>
                  <div className="mb-3 tabular-nums">
                    <CountUpNumber
                      value={stats.total_candidates}
                      active={statsInView && !isLoadingStats}
                      format={formatNumber}
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-blue-700 via-purple-600 to-purple-700 bg-clip-text text-transparent leading-none"
                    />
                  </div>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 font-bold tracking-wide uppercase">
                    {t?.welcome?.stats?.candidates || "Candidates"}
                  </p>
                </div>

                {/* Divider */}
                {stats.total_resumes > 0 && (
                  <div className="hidden md:block w-1 h-32 bg-gradient-to-b from-transparent via-blue-300 via-purple-300 to-transparent rounded-full"></div>
                )}

                {/* Resumes Stat */}
                {stats.total_resumes > 0 && (
                  <div className="group text-center transform transition-all duration-500 hover:scale-110">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      {/* Animated glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 group-hover:blur-3xl transition-all duration-500 animate-pulse-slow"></div>
                      {/* Icon container */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-pink-500/50 transition-all duration-500 transform group-hover:-rotate-6">
                        <FileText className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white" />
                      </div>
                    </div>
                    <div className="mb-3 tabular-nums">
                      <CountUpNumber
                        value={stats.total_resumes}
                        active={statsInView && !isLoadingStats}
                        format={formatNumber}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-600 via-pink-600 via-pink-700 to-pink-800 bg-clip-text text-transparent leading-none"
                      />
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 font-bold tracking-wide uppercase">
                      {t?.welcome?.stats?.resumes || "Resumes Created"}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Trust / proof strip — immediately after stats */}
        <div className="relative py-14 border-b border-blue-100/70 bg-gradient-to-br from-white via-blue-50/40 to-purple-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="group relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-white to-blue-50/60 p-6 text-left shadow-md shadow-blue-500/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/15">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/35 ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-105">
                  <Star className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <p className="relative text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold mb-2">
                  {trustProof.testimonialsTitle || "Testimonials"}
                </p>
                <p className="relative text-sm text-gray-600 leading-relaxed">
                  {trustProof.testimonialsText || "Rated highly by candidates and recruiters for speed, clarity, and ease of use."}
                </p>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-purple-100/90 bg-gradient-to-br from-white via-white to-purple-50/60 p-6 text-left shadow-md shadow-purple-500/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/15">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-400/10 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/35 ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-105">
                  <BadgePercent className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <p className="relative text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold mb-2">
                  {trustProof.pricingTitle || "Transparent pricing"}
                </p>
                <p className="relative text-sm text-gray-600 leading-relaxed">
                  {trustProof.pricingText || "Free to start, optional Pro when you want unlimited AI and full ATS insights."}
                </p>
                <Link
                  to="/pricing"
                  className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-85 underline-offset-4 hover:underline transition-opacity"
                >
                  {trustProof.pricingLink || "See plans"}
                  <ArrowRight className="h-4 w-4 shrink-0 text-purple-600 opacity-90" aria-hidden />
                </Link>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-pink-100/90 bg-gradient-to-br from-white via-white to-pink-50/50 p-6 text-left shadow-md shadow-pink-500/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/15">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-400/10 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-500/35 ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-105">
                  <Lock className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <p className="relative text-xs uppercase tracking-[0.2em] text-pink-600 font-semibold mb-2">
                  {trustProof.privacyTitle || "Privacy first"}
                </p>
                <p className="relative text-sm text-gray-600 leading-relaxed">
                  {trustProof.privacyText || "You control what is public. Private resumes stay private unless you choose to share."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Template Examples Section */}
        <div className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t?.welcome?.templates?.title || "Professional Templates"}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t?.welcome?.templates?.subtitle || "Choose from our collection of professionally designed resume templates"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {isLoadingTemplates ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : (
                templates.map((template, index) => (
                  <Link
                    key={template.id || index}
                    to={`/templates/public/preview/${template.id}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group block"
                  >
                    <div className="relative">
                      {template.preview_image_url ? (
                        <img
                          src={template.preview_image_url}
                          alt={`${template.name} Template`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            // Fallback to CSS preview if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      {/* Fallback CSS preview */}
                      <div className={`${template.preview_image_url ? 'hidden' : ''} bg-gradient-to-br from-blue-50 to-white h-48 p-4 border-b`}>
                        <div className="bg-white rounded-lg p-3 shadow-sm mb-3 border-l-4 border-blue-500">
                          <div className="h-3 bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <div className="h-2 bg-blue-200 rounded w-16"></div>
                            <div className="h-2 bg-gray-300 rounded flex-1"></div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="h-2 bg-blue-200 rounded w-20"></div>
                            <div className="h-2 bg-gray-300 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
                        <h3 className="text-xl font-bold">{template.name}</h3>
                        <p className="text-sm opacity-90">
                          {template.category || 'Professional'}
                        </p>
                      </div>
                      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <span className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                          Preview Template
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold mb-2 text-gray-900">{template.name} Template</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {template.description || `Professional ${template.name.toLowerCase()} template for all industries.`}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {template.category || 'Professional'}
                        </span>
                        {template.category === 'Corporate' && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Business
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                {t?.welcome?.templates?.more || "And many more templates available"}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {t?.welcome?.templates?.cta || "Choose Your Template"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {config.SHOW_WALKTHROUGH_SECTION && (
        <div className="relative py-20 border-y border-blue-100/80 bg-gradient-to-b from-white via-blue-50/25 to-purple-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">
                  {walkthrough.badge || "Product walkthrough"}
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mt-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {walkthrough.title || "See how your CV improves in minutes"}
                </h2>
                <p className="text-lg text-gray-600 mt-4 leading-relaxed">
                  {walkthrough.subtitle || "Watch the exact flow: choose a template, tailor with AI, check ATS feedback, and export with one click."}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    to="/resume/start"
                    onMouseEnter={prefetchEditorChunks}
                    className="cta-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl transition"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {walkthrough.cta || "Try the flow now"}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-blue-100 overflow-hidden shadow-xl shadow-blue-500/15 ring-1 ring-purple-500/10 bg-gray-900">
                <div className="aspect-video">
                  {resolvedWalkthroughVideo ? (
                    <iframe
                      className="w-full h-full"
                      src={resolvedWalkthroughVideo}
                      title={walkthrough.videoTitle || "HResume product walkthrough"}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="walkthrough-video-placeholder relative w-full h-full min-h-[12rem] flex flex-col items-center justify-center text-center px-6">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" aria-hidden />
                      <PlayCircle className="relative h-14 w-14 text-white/90 drop-shadow-md mb-3" />
                      <p className="relative text-white text-sm max-w-sm font-medium drop-shadow-sm leading-relaxed">
                        {walkthrough.videoPlaceholder || "Product walkthrough video is coming soon."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Before / After Transformations */}
        <div
          ref={transformationSectionRef}
          className={`transformation-section relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20${transformationInView ? " transformation-section--visible" : ""}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 transformation-section__heading">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600 font-semibold">
                {transformation.badge || "Real transformations"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {transformation.title || "Before and after examples"}
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed">
                {transformation.subtitle || "Users keep control while AI sharpens impact and ATS coverage."}
              </p>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(transformation.examples || []).slice(0, 2).map((example, idx) => {
                const phase = transformationPhase[idx] ?? "idle";
                return (
                  <div
                    key={idx}
                    className={`transformation-section__card transformation-section__card--${idx + 1} bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-500/5 p-6`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold mb-4">
                      {example.role || "Candidate example"}
                    </p>

                    {phase === "idle" && (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {transformation.enhanceHint ||
                            "Click the button to simulate AI rewriting this line of text."}
                        </p>
                        <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-4 text-left shadow-inner">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            {transformation.originalLabel || "Original text"}
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">{example.before}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTransformationEnhance(idx)}
                          disabled={transformationEnhancingIdx !== null}
                          className={`transformation-enhance-btn inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80${transformationEnhancingIdx === idx ? " transformation-enhance-btn--clicking" : ""}`}
                        >
                          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
                          {transformation.enhanceWithAi || "Enhance with AI"}
                        </button>
                      </div>
                    )}

                    {phase === "enhancing" && (
                      <div className="transformation-text-snippet transformation-text-snippet--enhancing relative overflow-hidden rounded-xl border border-purple-200/90 bg-gradient-to-br from-white to-purple-50/70 p-4 text-left shadow-md ring-2 ring-purple-300/30">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                          <div className="transformation-shimmer-bar absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90" />
                        </div>
                        <p className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-purple-600 mb-2">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden />
                          {transformation.enhancingLabel || "Enhancing with AI…"}
                        </p>
                        <p className="relative text-sm text-gray-800 leading-relaxed blur-[0.3px]">
                          {example.before}
                        </p>
                      </div>
                    )}

                    {phase === "done" && (
                      <div className="transformation-text-snippet transformation-text-snippet--result transformation-enhanced-enter rounded-xl border border-purple-200 bg-purple-50/90 p-4 text-left shadow-md ring-1 ring-purple-200/50">
                        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-purple-700 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600" aria-hidden />
                          {transformation.enhancedLabel || "Enhanced text"}
                        </p>
                        <p className="text-sm text-purple-950/95 leading-relaxed">{example.after}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Application suite — CV, cover letter, work certificate */}
        <div className="relative bg-white py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <ApplicationSuiteSection />
          </div>
        </div>

        {/* Features Section with enhanced styling */}
        <div className="relative bg-white py-20 pt-4">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="mb-4 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-purple-700 shadow-sm">
                  <Sparkles className="h-4 w-4 text-purple-600" aria-hidden />
                  {wf.aiBadge || "AI-assisted"}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {wf.title || t.welcome.features.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {featuresSubtitle || wf.subtitle || "Everything you need to create a professional resume that stands out"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-2xl p-8 shadow-lg transition-all duration-300 transform hover:-translate-y-2 border group ${
                      item.highlight
                        ? "border-purple-200/90 bg-gradient-to-br from-white via-purple-50/50 to-fuchsia-50/40 shadow-purple-500/15 ring-1 ring-purple-100 hover:shadow-xl hover:shadow-purple-500/20"
                        : "border-gray-100 bg-white hover:shadow-2xl"
                    }`}
                  >
                    {item.highlight ? (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        AI
                      </span>
                    ) : null}
                    <div
                      className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.grad} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${item.highlight ? "ring-2 ring-white/70" : ""}`}
                    >
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-3 text-gray-900 ${item.highlight ? "pr-16 md:pr-20" : ""}`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    {item.ai ? (
                      <div className="mt-5 flex gap-2.5 rounded-xl border border-purple-100/90 bg-gradient-to-br from-purple-50/80 to-white px-3.5 py-3 text-left shadow-sm">
                        <Sparkles className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" aria-hidden />
                        <p className="text-xs text-purple-950/90 leading-relaxed">{item.ai}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            
            {/* Reviews Carousel Section */}
            <ReviewsCarousel />
            
            {/* Final CTA Section */}
            <div className="mt-20 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 rounded-2xl">
                <div className="bg-white rounded-xl px-12 py-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {finalCta.title || "Ready to create your professional resume?"}
                  </h3>
                  <p className="text-xl text-gray-600 mb-2">
                    {finalCta.subtitle || "Join thousands of professionals who trust our platform"}
                  </p>
                  {finalCta.freeNote && (
                    <p className="text-base text-gray-500 mb-6">
                      {finalCta.freeNote}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                      to="/register" 
                      className="cta-primary inline-flex items-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-white rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {finalCta.candidate || "Candidate signup"}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </Link>
                    <Link 
                      to="/register/recruiter" 
                      className="inline-flex items-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl text-sm sm:text-base md:text-lg font-semibold text-slate-900 bg-white border border-slate-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {finalCta.recruiter || "Recruiter signup"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Benefits Section */}
        <div className="relative bg-slate-900 py-20">
          <div className="absolute inset-0 opacity-30 hero-background"></div>
          <div className="absolute inset-0 bg-slate-900/80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <p className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-slate-200 text-xs tracking-[0.3em] uppercase mb-4">
                {recruiterContent.badge || "Recruiter Mode"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {recruiterContent.heading || "Built for hiring teams too"}
              </h2>
              <p className="text-lg text-slate-200 max-w-3xl mx-auto">
                {recruiterContent.description || "Give recruiters direct access to curated resumes, advanced filters, and secure sharing tools to collaborate faster."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{recruiterCards.talent?.title || "Talent HQ"}</h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {recruiterCards.talent?.description || "Browse every resume in your workspace with smart search, template filters, and activity timelines."}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{recruiterCards.collaboration?.title || "Team Collaboration"}</h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {recruiterCards.collaboration?.description || "Share short-lived secure links with hiring managers and track interactions without exposing private data."}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{recruiterCards.preview?.title || "Live Preview"}</h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {recruiterCards.preview?.description || "Open any candidate profile in a rich viewer with experience, skills, and attachments ready to evaluate."}
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{recruiterCards.templates?.title || "Template Proposals"}</h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {recruiterCards.templates?.description || "Recruiters can submit branded template ideas and get them approved by admins in a single dashboard."}
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-8 md:p-10 text-center backdrop-blur-xl">
              <p className="text-slate-200 text-lg mb-6">
                {recruiterContent.testimonial || "“I can finally evaluate candidates without chasing PDF attachments or outdated resumes. The recruiter hub changed our hiring speed.”"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 sm:px-8 py-3 rounded-xl bg-white text-slate-900 text-sm sm:text-base md:text-lg font-semibold shadow-lg"
                >
                  {recruiterContent.primaryCta || "Access Recruiter Hub"}
                </Link>
                <Link
                  to="/register/recruiter"
                  className="inline-flex items-center px-6 sm:px-8 py-3 rounded-xl border border-white text-white text-sm sm:text-base md:text-lg font-semibold hover:bg-white/10 transition"
                >
                  {recruiterContent.secondaryCta || "Invite my team"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
