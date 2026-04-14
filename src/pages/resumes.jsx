import { Link } from 'react-router-dom';
import AuthLayout from "../Layouts/AuthLayout";
import { Plus, FileText, Download, Edit2, Trash2, Loader2, Calendar, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import { getMyResumes, remove } from '../services/resumeService';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Resumes() {
  const { t, language } = useLanguage();
  const [ownedResumes, setOwnedResumes] = useState([]);
  const [sharedResumes, setSharedResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, resume: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getResumes();
  }, []);

  const getResumes = async () => {
    try {
      setIsLoading(true);
      const response = await getMyResumes();
      if (response.data.status) {
        // Handle both old format (array) and new format (object with owned/shared)
        if (Array.isArray(response.data.data)) {
          setOwnedResumes(response.data.data);
          setSharedResumes([]);
        } else {
          setOwnedResumes(response.data.data.owned || []);
          setSharedResumes(response.data.data.shared || []);
        }
      } else {
        toast.error('Failed to load resumes');
      }
    } catch (error) {
      toast.error('Failed to load resumes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (resume) => {
    setDeleteDialog({ isOpen: true, resume });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.resume) return;
    
    setIsDeleting(true);
    try {
      await remove(deleteDialog.resume.id);
      toast.success('Resume deleted successfully');
      setOwnedResumes(ownedResumes.filter(r => r.id !== deleteDialog.resume.id));
      setSharedResumes(sharedResumes.filter(r => r.id !== deleteDialog.resume.id));
      setDeleteDialog({ isOpen: false, resume: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const locale = language === 'fr' ? 'fr-FR' : 'en-US';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getTemplateCategoryColor = (category) => {
    switch (category) {
      case 'Corporate':
        return 'bg-blue-100 text-blue-700';
      case 'Creative':
        return 'bg-purple-100 text-purple-700';
      case 'Simple':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">{t.common.loading}</p>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 animate-slide-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse-slow" />
                <span className="text-blue-600 font-semibold">Your Resumes</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.resumes.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {ownedResumes.length + sharedResumes.length} {ownedResumes.length + sharedResumes.length === 1 ? 'resume' : 'resumes'}
              </p>
            </div>
            <Link
              to="/resume/create"
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t.resumes.createNew}
            </Link>
          </div>

          {ownedResumes.length === 0 && sharedResumes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-slide-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t.resumes.noResumes}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {t.resumes.noResumesDesc}
              </p>
              <Link
                to="/resume/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t.resumes.createFirst}
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* My Resumes Section */}
              {ownedResumes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">My Resumes</h2>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {ownedResumes.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedResumes.map((resume) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        formatDate={formatDate}
                        getTemplateCategoryColor={getTemplateCategoryColor}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Resumes Section */}
              {sharedResumes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Shared with Me</h2>
                    <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {sharedResumes.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sharedResumes.map((resume) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        onDelete={null}
                        isDeleting={false}
                        formatDate={formatDate}
                        getTemplateCategoryColor={getTemplateCategoryColor}
                        t={t}
                        isShared={true}
                        ownerName={resume.user?.name || resume.user?.email || 'Unknown'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, resume: null })}
        onConfirm={confirmDelete}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        itemName={deleteDialog.resume?.name}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </AuthLayout>
  );
}

// Resume Card Component
function ResumeCard({ resume, onDelete, isDeleting, formatDate, getTemplateCategoryColor, t, isShared = false, ownerName = null }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 group"
    >
      {/* Template Preview */}
      <div className="relative h-56 bg-slate-50 flex items-start justify-center p-5 border-b border-gray-100">
        {resume.template?.preview_image_url ? (
          <img
            src={resume.template.preview_image_url}
            alt={resume.template.name || resume.name}
            className="max-h-full w-auto object-contain drop-shadow"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/600x800/0f172a/ffffff?text=${encodeURIComponent(resume.template?.name || resume.name)}`;
            }}
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
            {resume.template?.name || resume.name}
          </div>
        )}
        {resume.template?.category && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getTemplateCategoryColor(resume.template.category)}`}>
            {resume.template.category}
          </span>
        )}
        {isShared ? (
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            Shared
          </span>
        ) : (
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            Free
          </span>
        )}
      </div>

      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
              {resume.name}
            </h3>
            {resume.template && (
              <p className="text-sm text-gray-500">
                {resume.template.name}
              </p>
            )}
            {isShared && ownerName && (
              <p className="text-xs text-gray-500 mt-1">
                Shared by: {ownerName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">{t.resumes.lastModified}:</span>
            <span className="ml-2">{formatDate(resume.updated_at)}</span>
          </div>
          {resume.created_at && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">Created:</span>
              <span className="ml-2">{formatDate(resume.created_at)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Link
            to={`/resume/edit/${resume.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {t.common.edit}
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-sm"
              title={t.common.download}
            >
              <Download className="h-4 w-4 mr-1" />
              {t.common.download}
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(resume)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t.common.delete}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
