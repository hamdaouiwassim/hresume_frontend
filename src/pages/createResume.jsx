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
  const [step, setStep] = useState(1);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const selectedTemplateDetails = useMemo(() => {
    return templates.find((tpl) => tpl.id === selectedTemplate);
  }, [templates, selectedTemplate]);

  const nameSuggestions = useMemo(() => {
    if (!selectedTemplateDetails) return [];
    const base = selectedTemplateDetails.name?.split(' ')[0] || t.common.resume || 'Resume';
    const year = new Date().getFullYear();
    return [
      `${base} Resume`,
      `${base} ${year}`,
      `${base} Draft`,
    ];
  }, [selectedTemplateDetails, t.common]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
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
        <section className="space-y-6">
          <div className="bg-white rounded-2xl px-6 py-5 border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {[1, 2].map((stepNumber) => {
                const isActive = step === stepNumber;
                const isCompleted = step > stepNumber;
                const isClickable = stepNumber < step || (stepNumber === 1);
                return (
                  <button
                    key={stepNumber}
                    onClick={() => {
                      if (stepNumber === 1) {
                        setStep(1);
                      } else if (selectedTemplate) {
                        setStep(2);
                      }
                    }}
                    type="button"
                    className={`flex items-center gap-3 text-left transition ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                      isActive ? 'text-slate-900' : 'text-slate-500'
                    }`}
                    disabled={!isClickable}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                        isCompleted
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {stepNumber === 1
                          ? (t.createResume.stepOne || 'Pick a template')
                          : (t.createResume.stepTwo || 'Name your resume')}
                      </p>
                      <p className="text-xs text-slate-400">
                        {stepNumber === 1
                          ? (t.createResume.stepOneHint || 'Browse and select a layout')
                          : (t.createResume.stepTwoHint || 'Give your resume a title')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        {step === 1 && (
        <section className="space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                {t.createResume.templatesBadge || 'Templates'}
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {t.createResume.templateLabel || 'Choose your look'}
              </h2>
              <p className="text-slate-600 mt-2">
                {t.createResume.templateHint ||
                  'Each template is optimized for ATS scanners and recruiter readability.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.createResume.searchPlaceholder || 'Search template name or style'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {templateCategories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      type="button"
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {category === 'all' ? t.common.all || 'All' : category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isTemplatesLoading &&
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl p-4 animate-pulse space-y-4 bg-white">
                  <div className="h-44 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}

            {!isTemplatesLoading && filteredTemplates.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <Palette className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-semibold text-slate-700">
                  {t.createResume.noTemplatesTitle || 'No templates match your filters'}
                </p>
                <p className="text-slate-500 mt-2">
                  {t.createResume.noTemplatesSubtitle || 'Try clearing the filters or searching for another keyword.'}
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
                    className={`text-left border rounded-2xl p-4 bg-white shadow-sm hover:shadow-xl transition focus:outline-none ${
                      isSelected ? 'border-blue-500 shadow-blue-100 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="relative mb-4">
                      <div className="h-56 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-center p-4 overflow-hidden">
                        {template.preview_image_url ? (
                          <img
                            src={template.preview_image_url}
                            alt={template.name}
                            className="max-h-full w-auto object-contain drop-shadow"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/600x800/0f172a/ffffff?text=${encodeURIComponent(template.name)}`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                            {template.name}
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {template.category && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow">
                            {template.category}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 shadow">
                          Free
                        </span>
                      </div>
                      {isSelected && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow">
                          {t.common.selected || 'Selected'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      {template.description || t.createResume.templateHint}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span>{t.createResume.atsFriendly || 'ATS-Ready'}</span>
                    
                    </div>
                  </button>
                );
              })}
          </div>
        </section>
        )}

        {step === 2 && selectedTemplate && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg shadow-blue-100 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white flex items-center justify-center shadow-md shadow-blue-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-500">
                  {t.createResume.stepTwo || 'Step two'}
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {t.createResume.stepTwoHeadline || 'Give your resume a friendly name'}
                </h3>
              </div>
            </div>
            {selectedTemplateDetails && (
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-slate-600 shadow-inner">
                <p className="font-semibold text-slate-900">
                  {t.createResume.selectedTemplateLabel || 'Template'} · {selectedTemplateDetails.name}
                </p>
                {selectedTemplateDetails.category && (
                  <p className="text-xs text-blue-500 mt-1 uppercase tracking-[0.2em]">
                    {selectedTemplateDetails.category}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <label htmlFor="resumeName" className="text-sm font-semibold text-slate-700">
                {t.createResume.nameLabel}
              </label>
              <input
                type="text"
                id="resumeName"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder={t.createResume.namePlaceholder}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-base"
              />
              <p className="text-xs text-slate-500">
                {t.createResume.heroHint || 'You can edit every detail later. This label is for your dashboard only.'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-dashed border-blue-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                {t.createResume.suggestionsLabel || 'Suggestions'}
              </p>
              <p className="text-sm text-slate-600">
                {t.createResume.suggestionsHint || 'Tap to autofill a name:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {nameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setResumeName(suggestion)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600 transition shadow-sm hover:shadow-blue-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-2xl font-semibold border transition ${
              step === 1
                ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-white'
                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
            }`}
          >
            {t.common.back || 'Back'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                if (selectedTemplate) {
                  setStep(2);
                }
              } else if (step === 2) {
                handleSubmit();
              }
            }}
            disabled={(step === 1 && !selectedTemplate) || (step === 2 && (!resumeName || isSubmitting))}
            className={`px-6 py-3 rounded-2xl font-semibold text-white transition flex items-center justify-center gap-2 ${
              (step === 1 && !selectedTemplate) || (step === 2 && (!resumeName || isSubmitting))
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
            }`}
          >
            {isSubmitting && step === 2 && <Loader2 className="h-5 w-5 animate-spin" />}
            {step === 1 ? (t.common.next || 'Next') : (t.common.startEditingResume || 'Start editing')}
          </button>
        </div>

        
      </div>
    </AuthLayout>
  );
}