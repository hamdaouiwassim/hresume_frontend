import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../Layouts/AuthLayout';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { getMyResumes, getTemplates, saveNewResume } from '../services/resumeService';
import UpgradeProModal from '../components/UpgradeProModal';
import { Loader2, Search, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { saveGuestResumeDraft } from '../utils/guestResumeDraft';

const CLAIM_DRAFT_NEXT = '/resume/claim-draft';

export default function CreateResume() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const allowGuest = location.pathname === '/resume/start';
  const { user } = useContext(AuthContext);

  if (allowGuest && user) {
    return <Navigate to="/resume/create" replace />;
  }

  const [resumeName, setResumeName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [canCreateResume, setCanCreateResume] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const resumeNameInputRef = useRef(null);

  const canSubmit = Boolean(resumeName.trim() && selectedTemplate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      const msg =
        t.createResume.validationError ||
        'Please choose a template and enter a resume name.';
      if (allowGuest) toast.error(msg);
      else alert(msg);
      return;
    }

    if (allowGuest) {
      setIsSubmitting(true);
      try {
        saveGuestResumeDraft({
          name: resumeName.trim(),
          template_id: selectedTemplate,
        });
        toast.success(
          t.createResume.guestDraftSavedToast ||
            'Your choices are saved. Create an account to open your resume.'
        );
        navigate(`/register?next=${encodeURIComponent(CLAIM_DRAFT_NEXT)}`, { replace: true });
      } catch {
        toast.error(
          t.createResume.creationError || 'Something went wrong. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!canCreateResume) {
      setShowUpgradeModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await saveNewResume({
        name: resumeName.trim(),
        template_id: selectedTemplate,
      });
      navigate(`/resume/edit/${response.data.data.id}`);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'resume_limit_reached') {
        setCanCreateResume(false);
        setShowUpgradeModal(true);
        toast.error(
          err.response?.data?.message ||
            t.createResume.limitReached ||
            'Free plan includes one resume. Upgrade to Pro to create more.'
        );
        return;
      }
      toast.error(t.createResume.creationError || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    resumeNameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (allowGuest || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await getMyResumes();
        if (cancelled) return;
        const limits = response.data.limits;
        if (limits && limits.can_create === false) {
          setCanCreateResume(false);
          setShowUpgradeModal(true);
        }
      } catch {
        // allow submit; API will enforce
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowGuest, user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsTemplatesLoading(true);
      try {
        const response = await getTemplates();
        if (cancelled) return;
        const loadedTemplates = response.data.data || [];
        setTemplates(loadedTemplates);
        if (loadedTemplates.length) {
          setSelectedTemplate((prev) => prev || loadedTemplates[0].id);
        }
      } catch {
        // empty state
      } finally {
        if (!cancelled) setIsTemplatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const templateCategories = useMemo(() => {
    const categories = new Set(templates.map((tpl) => tpl.category || 'General'));
    return ['all', ...Array.from(categories)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesCategory =
        selectedCategory === 'all' || tpl.category === selectedCategory;
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (tpl.description || '').toLowerCase().includes(searchValue.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchValue]);

  const Shell = allowGuest ? GuestLayout : AuthLayout;

  return (
    <Shell>
      <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/90 to-purple-100/80">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-purple-400/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-32 right-1/4 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl"
        />

        <form
          onSubmit={handleSubmit}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-8"
        >
        {allowGuest && (
          <p className="text-sm text-slate-600 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-sm px-4 py-3">
            {t.createResume.guestBanner}
          </p>
        )}

        <header className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              {t.createResume.title || 'Create your resume'}
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              {t.createResume.pageSubtitle ||
                'Pick a name and template to get started.'}
            </p>
          </div>
          <div className="max-w-md space-y-1.5">
            <label htmlFor="resumeName" className="text-sm font-medium text-slate-700">
              {t.createResume.nameLabel || 'Resume name'}
            </label>
            <input
              ref={resumeNameInputRef}
              type="text"
              id="resumeName"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder={t.createResume.namePlaceholder || 'e.g. Product Designer 2026'}
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-lg border border-white/80 bg-white/80 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </header>

        <section className="space-y-4 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {t.createResume.templateLabel || 'Template'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder={t.createResume.searchPlaceholder || 'Search templates'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border border-white/80 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-sm'
                        : 'border-white/80 bg-white/70 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    {category === 'all' ? t.common.all || 'All' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isTemplatesLoading &&
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-3 animate-pulse bg-white"
                >
                  <div className="h-40 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}

            {!isTemplatesLoading && filteredTemplates.length === 0 && (
              <div className="col-span-full border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-slate-700">
                  {t.createResume.noTemplatesTitle || 'No templates found'}
                </p>
              </div>
            )}

            {!isTemplatesLoading &&
              filteredTemplates.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`text-left border rounded-xl p-3 bg-white/90 backdrop-blur-sm shadow-sm transition focus:outline-none ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-md shadow-blue-100/50'
                        : 'border-white/80 hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="relative mb-2">
                      <div className="h-40 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {template.preview_image_url ? (
                          <img
                            src={template.preview_image_url}
                            alt={template.name}
                            className="max-h-full w-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/400x520/e2e8f0/64748b?text=${encodeURIComponent(template.name)}`;
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium text-slate-500">{template.name}</span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-600 text-white">
                          {t.common.selected || 'Selected'}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                  </button>
                );
              })}
          </div>
        </section>

        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-white/60 bg-white/80 backdrop-blur-md shadow-[0_-4px_24px_rgba(59,130,246,0.08)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition ${
                !canSubmit || isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25'
              }`}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {allowGuest
                ? t.createResume.guestFinalButton || 'Continue to sign up'
                : t.common.startEditingResume || 'Start editing'}
            </button>
          </div>
          {allowGuest && (
            <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 text-xs text-slate-500 text-center sm:text-right">
              {t.createResume.guestHasAccount}{' '}
              <Link
                to={`/login?next=${encodeURIComponent(CLAIM_DRAFT_NEXT)}`}
                className="text-blue-600 hover:underline"
              >
                {t.createResume.guestLoginLink}
              </Link>
            </p>
          )}
        </div>
        </form>
      </div>
      <UpgradeProModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        variant="resume_limit"
      />
    </Shell>
  );
}
