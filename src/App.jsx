
import './App.css'
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import RecruiterRoute from './components/RecruiterRoute';

// Critical route - load immediately for landing page
import Welcome from './pages/welcome'

// Lazy load non-critical routes for better initial load performance
const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/register'));
const RecruiterRegister = lazy(() => import('./pages/RecruiterRegister'));
const Resumes = lazy(() => import('./pages/resumes'));
const Templates = lazy(() => import('./pages/templates'));
const CreateResume = lazy(() => import('./pages/createResume'));
const EditResume = lazy(() => import('./pages/EditResume'));
const SharedResumeView = lazy(() => import('./pages/SharedResumeView'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsersList = lazy(() => import('./pages/admin/UsersList'));
const AdminTemplatesManagement = lazy(() => import('./pages/admin/TemplatesManagement'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const RecruiterResumes = lazy(() => import('./pages/recruiter/Resumes'));
const RecruiterTemplateProposals = lazy(() => import('./pages/recruiter/TemplateProposals'));
const RecruiterPendingActivation = lazy(() => import('./pages/recruiter/PendingActivation'));
const RecruiterProfile = lazy(() => import('./pages/recruiter/Profile'));
const Forbidden = lazy(() => import('./pages/errors/Forbidden'));
const TrackRequest = lazy(() => import('./pages/TrackRequest'));
const SocialCallback = lazy(() => import('./pages/SocialCallback'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ResumeTemplates = lazy(() => import('./pages/ResumeTemplates'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Review = lazy(() => import('./pages/Review'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/recruiter" element={<RecruiterRegister />} />
            <Route path="/share/:token" element={<SharedResumeView />} />
            <Route path="/auth/social-callback" element={<SocialCallback />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/track-request" element={<TrackRequest />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/templates/public" element={<ResumeTemplates />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
                        

            <Route path="/resume/edit/:id" element={<PrivateRoute><EditResume />  </PrivateRoute>} />
               <Route path="/resumes" element={<PrivateRoute><Resumes /></PrivateRoute>} />
            <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
          {/* New path for creating a resume */}
          <Route path="/resume/create" element={<PrivateRoute><CreateResume /></PrivateRoute>} />
          {/* Profile page */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          {/* Review page */}
          <Route path="/review" element={<PrivateRoute><Review /></PrivateRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersList /></AdminRoute>} />
          <Route path="/admin/templates" element={<AdminRoute><AdminTemplatesManagement /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
          
          {/* Recruiter routes */}
          <Route path="/recruiter/resumes" element={<RecruiterRoute><RecruiterResumes /></RecruiterRoute>} />
          <Route path="/recruiter/templates" element={<RecruiterRoute><RecruiterTemplateProposals /></RecruiterRoute>} />
          <Route path="/recruiter/profile" element={<RecruiterRoute><RecruiterProfile /></RecruiterRoute>} />
          <Route path="/recruiter/pending" element={<PrivateRoute><RecruiterPendingActivation /></PrivateRoute>} />
          <Route path="/403" element={<Forbidden />} />
         
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}


export default App
