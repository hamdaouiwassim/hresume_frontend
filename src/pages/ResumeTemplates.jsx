import { Link } from 'react-router-dom';
import GuestLayout from "../Layouts/GuestLayout";
import { FileText, CheckCircle, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ResumeTemplates() {
  const { t } = useLanguage();
  const templates = t?.resumeTemplates || {};

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse-slow" />
              <span className="text-blue-600 font-semibold">{templates.badge || "Professional Templates"}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {templates.title || "Resume Templates"}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {templates.subtitle || "Choose from our collection of professional, ATS-friendly resume templates"}
            </p>
          </div>

          {/* Current Status Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 md:p-8 mb-12 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {templates.currentStatus?.title || "Current Template Availability"}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {templates.currentStatus?.message || "At the moment, we offer 1 ATS-friendly template designed to help your resume pass through Applicant Tracking Systems. We're working hard to expand our collection with more professional templates in the near future."}
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Zap className="h-5 w-5" />
                  <span>{templates.currentStatus?.comingSoon || "More templates coming soon!"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Template Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {templates.features?.ats?.title || "ATS-Friendly"}
              </h3>
              <p className="text-gray-600">
                {templates.features?.ats?.description || "Optimized to pass through Applicant Tracking Systems used by most employers"}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {templates.features?.professional?.title || "Professional Design"}
              </h3>
              <p className="text-gray-600">
                {templates.features?.professional?.description || "Clean, modern layouts that make a great first impression"}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {templates.features?.customizable?.title || "Fully Customizable"}
              </h3>
              <p className="text-gray-600">
                {templates.features?.customizable?.description || "Easily customize colors, fonts, and layout to match your style"}
              </p>
            </div>
          </div>

          {/* Template Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {templates.preview?.title || "Our Current Template"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {templates.preview?.description || "Our ATS-friendly template is designed to help your resume stand out while ensuring it can be properly parsed by automated systems."}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {templates.preview?.templateName || "ATS-Friendly Professional Template"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {templates.preview?.templateDescription || "A clean, professional template optimized for both human readers and ATS systems"}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {templates.preview?.tags?.ats || "ATS-Friendly"}
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {templates.preview?.tags?.professional || "Professional"}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {templates.preview?.tags?.modern || "Modern"}
                  </span>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {templates.preview?.cta || "Get Started Free"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Template Preview Pages</h2>
              <p className="text-gray-600">Open each CV template with sample data to see the full layout.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/templates/public/preview/1" className="block rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <p className="font-semibold text-gray-900">Classic</p>
                <p className="text-sm text-gray-600 mt-1">Traditional and ATS-friendly.</p>
              </Link>
              <Link to="/templates/public/preview/2" className="block rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <p className="font-semibold text-gray-900">Executive Split</p>
                <p className="text-sm text-gray-600 mt-1">Premium split-column structure.</p>
              </Link>
              <Link to="/templates/public/preview/3" className="block rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:bg-green-50 transition-colors">
                <p className="font-semibold text-gray-900">Modern Professional</p>
                <p className="text-sm text-gray-600 mt-1">Balanced modern two-column design.</p>
              </Link>
            </div>
          </div>

          {/* Future Templates Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {templates.future?.title || "More Templates Coming Soon"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                {templates.future?.description || "We're continuously working on expanding our template collection. In the future, you'll be able to choose from a variety of styles including:"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {templates.future?.types?.corporate || "Corporate"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {templates.future?.types?.corporateDesc || "Traditional and professional designs for corporate environments"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {templates.future?.types?.creative || "Creative"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {templates.future?.types?.creativeDesc || "Bold and unique designs for creative professionals"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {templates.future?.types?.minimal || "Minimal"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {templates.future?.types?.minimalDesc || "Clean and simple designs that focus on content"}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                {templates.future?.footer || "Stay tuned for updates! We'll notify you when new templates are available."}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                {templates.future?.cta || "Create your free account to be notified"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

