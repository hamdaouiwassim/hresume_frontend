import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Save,
  Loader2,
  X
} from "lucide-react";
import { storeProject, updateProject } from "../services/ProjectService";
import { toast } from "sonner";

export default function NewProject({ project = {
    name: "",
    description: "",
    technologies: "",
    url: "",
    startDate: null,
    endDate: null,
    experience_id: null,
}, index = null, hide, resumeId, experiences = [], edit = false, onSave, onPreviewChange, onPreviewClear }) {
const { t } = useLanguage();
const [errors,setErrors]=useState({});
const [isLoading, setIsLoading] = useState(false);
const [projectState,setProject] = useState(project);

const buttonBase = "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
const buttonVariants = {
  primary: `${buttonBase} px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 focus:ring-offset-white`,
  danger: `${buttonBase} px-4 py-2 border border-red-200 text-red-600 bg-white hover:border-red-300 hover:bg-red-50 focus:ring-red-400 focus:ring-offset-white`,
};
const disabledButtonClasses = "opacity-50 cursor-not-allowed pointer-events-none";

const validateProject = (projectData) => {
    const newErrors = {};
    if (!projectData.name || projectData.name.trim() === '') {
        newErrors.name = ['Project name is required'];
    }
    return newErrors;
};

const hasValidationErrors = () => {
    const validationErrors = validateProject(projectState);
    return Object.keys(validationErrors).length > 0 || Object.keys(errors).length > 0;
};

const handleStoreProject = async () => {
    const validationErrors = validateProject(projectState);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
   
    setIsLoading(true);
    const payload = { ...projectState, resume_id: resumeId };
    if (payload.experience_id === "" || payload.experience_id === undefined) payload.experience_id = null;
    try {
    const response = await storeProject(payload);
    closeForm();
    toast.success(response.data.message || "");
    if (onSave) onSave();
    }catch(error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error("Error saving project. Please try again.");
    } finally {
      setIsLoading(false);
    }

  }
const handleUpdateProject = async () => {
    const validationErrors = validateProject(projectState);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setIsLoading(true);
    const payload = { ...projectState };
    if (payload.experience_id === "" || payload.experience_id === undefined) payload.experience_id = null;
    try {
    const response = await updateProject(payload, projectState.id);
    closeForm();
    toast.success(response.data.message || "");
    if (onSave) onSave();
    }catch(error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error("Error updating project. Please try again.");
    } finally {
      setIsLoading(false);
    }
}

    const previewChangeRef = useRef(onPreviewChange);
    useEffect(() => {
      previewChangeRef.current = onPreviewChange;
    }, [onPreviewChange]);

    useEffect(() => {
      previewChangeRef.current?.(projectState);
    }, [projectState]);

    const previewClearRef = useRef(onPreviewClear);
    useEffect(() => {
      previewClearRef.current = onPreviewClear;
    }, [onPreviewClear]);

    useEffect(() => {
      return () => {
        previewClearRef.current?.();
      };
    }, []);

    const closeForm = () => {
      previewClearRef.current?.();
      hide && hide();
    };

    return (
            <div
                      key={index}
                      className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-200/60 rounded-2xl p-6 space-y-5 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-semibold text-slate-800">
                          {edit ? "Edit Project" : `Project ${index !== null ? `#${index + 1}` : ''}`}
                        </h4>
                        <button
                          type="button"
                          onClick={closeForm}
                          className={`${buttonVariants.danger} p-2`}
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        {experiences && experiences.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {t.dashboard.sections.projects?.project?.underExperience ?? "Under experience"}{" "}
                            <span className="text-slate-400 font-normal text-xs">(optional)</span>
                          </label>
                          <select
                            value={projectState.experience_id ?? ""}
                            onChange={(e) => setProject({ ...projectState, experience_id: e.target.value || null })}
                            className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3"
                          >
                            <option value="">— None (standalone project) —</option>
                            {experiences.map((exp) => (
                              <option key={exp.id} value={exp.id}>
                                {exp.company || "Company"} – {exp.position || "Position"}
                              </option>
                            ))}
                          </select>
                        </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.projects.project.name }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.projects.project.nameHint })
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={projectState.name}
                              onChange={(e) => {
                                setProject({...projectState, name: e.target.value});
                                if (errors.name) {
                                    const newErrors = {...errors};
                                    delete newErrors.name;
                                    setErrors(newErrors);
                                }
                              }}
                              className={`w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3 ${
                                errors.name ? 'border-red-500 ring-red-200' : ''
                              }`}
                              placeholder={ t.dashboard.sections.projects.project.namePlaceholder }
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-sm text-red-600">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.projects.project.url }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.projects.project.urlHint })
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={projectState.url || ""}
                              onChange={(e) => {
                                setProject({...projectState, url: e.target.value});
                                if (errors.url) {
                                    const newErrors = {...errors};
                                    delete newErrors.url;
                                    setErrors(newErrors);
                                }
                              }}
                              className={`w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3 ${
                                errors.url ? 'border-red-500 ring-red-200' : ''
                              }`}
                              placeholder={ t.dashboard.sections.projects.project.urlPlaceholder }
                            />
                            {errors.url && (
                                <p className="mt-1.5 text-sm text-red-600">{Array.isArray(errors.url) ? errors.url[0] : errors.url}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.projects.project.technologies }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.projects.project.technologiesHint })
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={projectState.technologies || ""}
                              onChange={(e) => {
                                setProject({...projectState, technologies: e.target.value});
                                if (errors.technologies) {
                                    const newErrors = {...errors};
                                    delete newErrors.technologies;
                                    setErrors(newErrors);
                                }
                              }}
                              className={`w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3 ${
                                errors.technologies ? 'border-red-500 ring-red-200' : ''
                              }`}
                              placeholder={ t.dashboard.sections.projects.project.technologiesPlaceholder }
                            />
                            {errors.technologies && (
                                <p className="mt-1.5 text-sm text-red-600">{Array.isArray(errors.technologies) ? errors.technologies[0] : errors.technologies}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              { t.dashboard.sections.projects.project.startDate }{" "}
                              <span className="text-slate-400 font-normal text-xs">
                                ({ t.dashboard.sections.projects.project.startDateHint })
                              </span>
                            </label>
                            <input
                              type="date"
                              value={projectState.startDate || ""}
                              onChange={(e) =>
                                setProject(
                                  {...projectState, startDate :e.target.value}
                                  
                                )
                              }
                              className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              { t.dashboard.sections.projects.project.endDate }{" "}
                              <span className="text-slate-400 font-normal text-xs">
                                ({ t.dashboard.sections.projects.project.endDateHint })
                              </span>
                            </label>
                            <input
                              type="date"
                              value={projectState.endDate || ""}
                              onChange={(e) =>
                                setProject(
                                  {...projectState, endDate :e.target.value}
                                  
                                )
                              }
                              className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.projects.project.description }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.projects.project.descriptionHint })
                            </span>
                          </label>
                          <textarea
                            rows={4}
                            value={projectState.description || ""}
                            onChange={(e) =>
                                setProject(
                                  {...projectState, description :e.target.value}
                                  
                                )
                              }
                            className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm p-4 resize-none"
                            placeholder={ t.dashboard.sections.projects.project.descriptionPlaceholder }
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                    <button 
                        type="button"
                        onClick={ ()=> { !edit ? handleStoreProject(index) : handleUpdateProject(index) } } 
                        disabled={hasValidationErrors() || isLoading}
                        className={`${buttonVariants.primary} ${
                            hasValidationErrors() || isLoading ? disabledButtonClasses : ""
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> 
                                <span>{t.common.loading}</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> 
                                <span>{!edit ? t.common.save : t.common.update}</span>
                            </>
                        )}
                    </button>
                </div>
                      </div>
                    </div>
    )

}

