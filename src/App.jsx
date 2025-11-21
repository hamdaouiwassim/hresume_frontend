
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/welcome'
import Login from './pages/login'
import Register from './pages/register'
import RecruiterRegister from './pages/RecruiterRegister'
import Resumes from './pages/resumes'
import Templates from './pages/templates';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import CreateResume from './pages/createResume';
import EditResume from './pages/EditResume';
import SharedResumeView from './pages/SharedResumeView';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersList from './pages/admin/UsersList';
import AdminTemplatesManagement from './pages/admin/TemplatesManagement';
import AdminProfile from './pages/admin/AdminProfile';
import RecruiterRoute from './components/RecruiterRoute';
import RecruiterResumes from './pages/recruiter/Resumes';
import RecruiterTemplateProposals from './pages/recruiter/TemplateProposals';
import RecruiterPendingActivation from './pages/recruiter/PendingActivation';
import RecruiterProfile from './pages/recruiter/Profile';
import Forbidden from './pages/errors/Forbidden';
import TrackRequest from './pages/TrackRequest';
import SocialCallback from './pages/SocialCallback';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import ResumeTemplates from './pages/ResumeTemplates';
import Pricing from './pages/Pricing';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
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
                      

          <Route path="/resume/edit/:id" element={<PrivateRoute><EditResume />  </PrivateRoute>} />
             <Route path="/resumes" element={<PrivateRoute><Resumes /></PrivateRoute>} />
          <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        {/* New path for creating a resume */}
        <Route path="/resume/create" element={<PrivateRoute><CreateResume /></PrivateRoute>} />
        {/* Profile page */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersList /></AdminRoute>} />
        <Route path="/admin/templates" element={<AdminRoute><AdminTemplatesManagement /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        
        {/* Recruiter routes */}
        <Route path="/recruiter/resumes" element={<RecruiterRoute><RecruiterResumes /></RecruiterRoute>} />
        <Route path="/recruiter/templates" element={<RecruiterRoute><RecruiterTemplateProposals /></RecruiterRoute>} />
        <Route path="/recruiter/profile" element={<RecruiterRoute><RecruiterProfile /></RecruiterRoute>} />
        <Route path="/recruiter/pending" element={<PrivateRoute><RecruiterPendingActivation /></PrivateRoute>} />
        <Route path="/403" element={<Forbidden />} />
       
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}


export default App
