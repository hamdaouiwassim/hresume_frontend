import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../Layouts/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { getTemplates, saveNewResume } from '../services/resumeService';
import { Adsense } from '@ctrl/react-adsense';
import { Layout, Sparkles, CheckCircle2, Loader2, ChevronRight, Search, Palette } from 'lucide-react';

export default function CreateResume() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeName || !selectedTemplate) {
      alert(t.createResume.validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const newResumeData = {
        name: resumeName,
        template_id: selectedTemplate,
      };

      const response = await saveNewResume(newResumeData);
      navigate(`/resume/edit/${response.data.data.id}`); 
    } catch (error) {
      console.error("Error creating resume:", error);
      alert(t.createResume.creationError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const response = await getTemplates();
      const loadedTemplates = response.data.data || [];
      setTemplates(loadedTemplates);
      if (loadedTemplates.length && !selectedTemplate) {
        setSelectedTemplate(loadedTemplates[0].id);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    getAllTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white rounded-3xl overflow-hidden shadow-xl relative">
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_45%)]"></div>
          </div>
          <div className="p-8 lg:p-12 relative z-10 flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-[0.3em]">
                <Sparkles className="h-4 w-4" />
                {t.createResume.heroBadge || 'Launch mode'}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                {t.createResume.title}
              </h1>
              <p className="text-slate-200 text-lg max-w-2xl">
                {t.createResume.heroSubtitle ||
                  'Choose a polished template, give it a name, and start editing your resume with real time preview and recruiter-ready formatting.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: t.createResume.stepOne || 'Pick a template', icon: <Layout className="h-5 w-5" /> },
                  { label: t.createResume.stepTwo || 'Name your resume', icon: <CheckCircle2 className="h-5 w-5" /> },
                  { label: t.createResume.stepThree || 'Start editing', icon: <ChevronRight className="h-5 w-5" /> },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2 text-white">
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full max-w-sm bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
              <p className="text-sm uppercase tracking-wide text-slate-200 mb-3">{t.createResume.formTitle || 'Quick setup'}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resumeName" className="text-sm font-medium text-slate-100">
                    {t.createResume.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="resumeName"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder={t.createResume.namePlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTemplate}
                  className="w-full px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isSubmitting ? t.common.creatingResume : t.common.startEditingResume}
                </button>
              </form>
              <p className="text-xs text-slate-300 mt-4 text-center">{t.createResume.heroHint || 'You can edit every detail later. No credit card required.'}</p>
            </div>
          </div>
        </section>

        {/* <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t.createResume.templatesBadge || 'Templates'}</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">{t.createResume.templateLabel}</h2>
              <p className="text-slate-600 mt-2">
                {t.createResume.templateHint || 'Each template is optimized for ATS scanners and recruiter readability.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.createResume.searchPlaceholder || 'Search template name or style'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    type="button"
                    className={`px-3 py-2 rounded-xl text-sm border transition ${
                      selectedCategory === category
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {category === 'all' ? t.common.all || 'All' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isTemplatesLoading && Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-4 animate-pulse space-y-4">
                <div className="h-40 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}

            {!isTemplatesLoading && filteredTemplates.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <Palette className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-semibold text-slate-700">{t.createResume.noTemplatesTitle || 'No templates match your filters'}</p>
                <p className="text-slate-500 mt-2">{t.createResume.noTemplatesSubtitle || 'Try clearing the filters or searching for another keyword.'}</p>
              </div>
            )}

            {!isTemplatesLoading && filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left border rounded-2xl p-4 bg-white shadow-sm hover:shadow-xl transition focus:outline-none ${
                  selectedTemplate === template.id ? 'border-blue-500 shadow-blue-100 ring-2 ring-blue-200' : 'border-slate-200'
                }`}
              >
                <div className="relative mb-4">
                  <img
                    src={template.preview_image_url || '/placeholder-template.png'}
                    alt={template.name}
                    className="w-full h-48 object-cover rounded-xl border border-slate-100"
                  />
                  {template.category && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800">
                      {template.category}
                    </span>
                  )}
                  {selectedTemplate === template.id && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                      {t.common.selected || 'Selected'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{template.name}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  {template.description || t.createResume.templateHint}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>{t.createResume.atsFriendly || 'ATS-Ready'}</span>
                  <span>{t.createResume.quickEdit || 'Quick edit'}</span>
                </div>
              </button>
            ))}
          </div>
        </section> */}

        <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
          <Adsense
            client="ca-pub-6342943160992337"
            slot="1283589281"
            style={{ display: 'block' }}
            layout="in-article"
            format="fluid"
          />
        </div>
      </div>
    </AuthLayout>
  );
}