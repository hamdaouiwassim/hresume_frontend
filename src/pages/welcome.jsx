
import { Link } from 'react-router-dom';
import GuestLayout from "../Layouts/GuestLayout";
import homebg from "../assets/home-bg.jpg";
import { FileText, Layout, Rocket, CheckCircle, Award, ArrowRight, PlayCircle, Sparkles, Briefcase, Users, Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './welcome.css';
export default function Welcome() {
  const { t } = useLanguage();
  const recruiterContent = t?.welcome?.recruiter || {};
  const recruiterCards = recruiterContent.cards || {};
  const trustStrings = t?.welcome?.trust || {};
  const finalCta = t?.welcome?.finalCta || {};
  const featuresSubtitle = t?.welcome?.features?.subtitle;

  
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
                      className="cta-primary inline-flex items-center px-8 py-4 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      {t.welcome.getStarted}
                      <ArrowRight className="h-5 w-5 ml-2" />
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
                  <div className="mt-8 flex items-center gap-6 text-sm text-gray-600 mb-8">
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
                      className="cta-primary inline-flex items-center px-10 py-4 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      {finalCta.candidate || "Candidate signup"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                    <Link 
                      to="/register/recruiter" 
                      className="inline-flex items-center px-10 py-4 rounded-xl text-lg font-semibold text-slate-900 bg-white border border-slate-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Briefcase className="h-5 w-5 mr-2" />
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
                  className="inline-flex items-center px-8 py-3 rounded-xl bg-white text-slate-900 font-semibold shadow-lg"
                >
                  {recruiterContent.primaryCta || "Access Recruiter Hub"}
                </Link>
                <Link
                  to="/register/recruiter"
                  className="inline-flex items-center px-8 py-3 rounded-xl border border-white text-white font-semibold hover:bg-white/10 transition"
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
