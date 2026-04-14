
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GuestLayout from "../Layouts/GuestLayout";
import homebg from "../assets/home-bg.webp";
import { FileText, Layout, Rocket, CheckCircle, Award, ArrowRight, PlayCircle, Sparkles, Briefcase, Users, Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ReviewsCarousel from '../components/ReviewsCarousel';
import { getStats } from '../services/statsService';
import { getTemplates } from '../services/templateService';
import './welcome.css';
export default function Welcome() {
  const { t } = useLanguage();
  const recruiterContent = t?.welcome?.recruiter || {};
  const recruiterCards = recruiterContent.cards || {};
  const trustStrings = t?.welcome?.trust || {};
  const finalCta = t?.welcome?.finalCta || {};
  const featuresSubtitle = t?.welcome?.features?.subtitle;
  const [stats, setStats] = useState({ total_candidates: 0, total_resumes: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
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

  
  return (
    <GuestLayout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        
        {/* Hero Section with Gradient Background */}
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen hero-background">
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-wrap items-center">
              <div className="w-full lg:w-6/12 px-4">
                <div className="lg-pt-32 sm:pt-0 animate-slide-in pt-6">
                  {/* Sparkles decoration */}
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-blue-600 animate-pulse-slow" />
                    <span className="text-blue-600 font-semibold">
                      {t?.welcome?.heroBadge || "Professional CV Builder"}
                    </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t.welcome.title}
                  </h1>
                  <p className="mt-4 text-xl lg:text-2xl leading-relaxed text-gray-700">
                    {t.welcome.subtitle}
                  </p>
                  
                  {/* Enhanced CTA Buttons */}
                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link 
                      to="/register" 
                      className="cta-primary inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {t.welcome.getStarted}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
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
                    <p className="mt-3 text-sm text-gray-600">
                      {t.welcome.freeDescription}
                    </p>
                  )}
                  
                  {/* Trust indicators */}
                  <div className="mt-8 flex items-center gap-6 text-sm text-gray-600 mb-8 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{trustStrings.free || "Free to use"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{trustStrings.noCard || "No credit card"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{trustStrings.instant || "Instant download"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative animate-float">
                  <img 
                    src={homebg} 
                    alt={t.common.appName} 
                    className="max-w-full rounded-2xl shadow-2xl relative z-10 border-4 border-white/50" 
                  />
                  
                  {/* Multiple animated blobs */}
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                  <div className="absolute -top-8 -right-8 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute top-1/2 -left-4 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-4000"></div>
                  <div className="absolute bottom-1/4 -right-4 w-36 h-36 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-6000"></div>
                  
                  {/* Decorative circle */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-rotate-slow"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-rotate-slow" style={{ animationDirection: 'reverse' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - After Hero */}
        <div className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-20 -mt-16 overflow-hidden">
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
                  <div className="mb-3">
                    <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-blue-700 via-purple-600 to-purple-700 bg-clip-text text-transparent leading-none">
                      {formatNumber(stats.total_candidates)}
                    </span>
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
                    <div className="mb-3">
                      <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-600 via-pink-600 via-pink-700 to-pink-800 bg-clip-text text-transparent leading-none">
                        {formatNumber(stats.total_resumes)}
                      </span>
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

        {/* Template Examples Section */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-20">
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

        {/* Features Section with enhanced styling */}
        <div className="relative bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.welcome.features.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {featuresSubtitle || "Everything you need to create a professional resume that stands out"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t.welcome.features.easy}</h3>
                <p className="text-gray-600 leading-relaxed">{t.welcome.features.easyDesc}</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layout className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t.welcome.features.professional}</h3>
                <p className="text-gray-600 leading-relaxed">{t.welcome.features.professionalDesc}</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t.welcome.features.ats}</h3>
                <p className="text-gray-600 leading-relaxed">{t.welcome.features.atsDesc}</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t.welcome.features.export}</h3>
                <p className="text-gray-600 leading-relaxed">{t.welcome.features.exportDesc}</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{t.welcome.features.multilingual}</h3>
                <p className="text-gray-600 leading-relaxed">{t.welcome.features.multilingualDesc}</p>
              </div>
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
