import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Save,
  Loader2,
  X
} from "lucide-react";
import { storeEducation, updateEducation } from "../services/EducationService";
import { toast } from "sonner";

export default function NewEducation({edu = {
        institution : "",
        degree : "",
        start_date : null,
        end_date : null,
        description : ""
    } ,index = null  , hide , resumeId , edit=false , onSave}) {
const { t } = useLanguage();
const [errors,setErrors]=useState({});
const [isLoading, setIsLoading] = useState(false);

const buttonBase = "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
const buttonVariants = {
  primary: `${buttonBase} px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 focus:ring-offset-white`,
  danger: `${buttonBase} px-4 py-2 border border-red-200 text-red-600 bg-white hover:border-red-300 hover:bg-red-50 focus:ring-red-400 focus:ring-offset-white`,
};
const disabledButtonClasses = "opacity-50 cursor-not-allowed pointer-events-none";

const validateEducation = () => {
    const newErrors = {};
    if (!education.institution || education.institution.trim() === '') {
        newErrors.institution = ['Institution is required'];
    }
    if (!education.degree || education.degree.trim() === '') {
        newErrors.degree = ['Degree is required'];
    }
    return newErrors;
};

const hasValidationErrors = () => {
    const validationErrors = validateEducation();
    return Object.keys(validationErrors).length > 0 || Object.keys(errors).length > 0;
};

const handleStoreEducation = async () => {
    const validationErrors = validateEducation();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
   
    setIsLoading(true);
    let data = {...education , resume_id : resumeId }
    try{
    const response = await storeEducation(data);
    hide()
    toast.success(response.data.message || "");
    if (onSave) onSave();
    }catch(error) {
      if (error.response && error.response.data && error.response.data.errors) {
        console.log(error.response.data.errors);
        setErrors(error.response.data.errors);
      }
      toast.error("Error saving education. Please try again.");
    } finally {
      setIsLoading(false);
    }

  }
const handleUpdateEducation = async () => {
    const validationErrors = validateEducation();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setIsLoading(true);
    let data = {...education }
    try{
    const response = await updateEducation(data,edu.id);
    hide()
    toast.success(response.data.message || "");
    if (onSave) onSave();
    }catch(error) {
      if (error.response && error.response.data && error.response.data.errors) {
        console.log(error.response.data.errors);
        setErrors(error.response.data.errors);
      }
      toast.error("Error updating education. Please try again.");
    } finally {
      setIsLoading(false);
    }
}
    const [education,setEducation] = useState(edu);

    return (
            <div
                      key={index}
                      className="bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-purple-200/60 rounded-2xl p-6 space-y-5 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-semibold text-slate-800">
                          {edit ? "Edit Education" : `Education ${index !== null ? `#${index + 1}` : ''}`}
                        </h4>
                        <button
                          type="button"
                          onClick={hide}
                          className={`${buttonVariants.danger} p-2`}
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.educations.education.institution }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.educations.education.institutionHint })
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={education.institution}
                              onChange={(e) => {
                                setEducation({...education, institution: e.target.value});
                                if (errors.institution) {
                                    const newErrors = {...errors};
                                    delete newErrors.institution;
                                    setErrors(newErrors);
                                }
                              }}
                              className={`w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3 ${
                                errors.institution ? 'border-red-500 ring-red-200' : ''
                              }`}
                              placeholder={ t.dashboard.sections.educations.education.companyPlaceholder }
                            />
                            {errors.institution && (
                                <p className="mt-1.5 text-sm text-red-600">{Array.isArray(errors.institution) ? errors.institution[0] : errors.institution}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.educations.education.degree }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.educations.education.degreeHint })
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={education.degree}
                              onChange={(e) => {
                                setEducation({...education, degree: e.target.value});
                                if (errors.degree) {
                                    const newErrors = {...errors};
                                    delete newErrors.degree;
                                    setErrors(newErrors);
                                }
                              }}
                              className={`w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3 ${
                                errors.degree ? 'border-red-500 ring-red-200' : ''
                              }`}
                              placeholder={ t.dashboard.sections.educations.education.degreePlaceholder }
                            />
                            {errors.degree && (
                                <p className="mt-1.5 text-sm text-red-600">{Array.isArray(errors.degree) ? errors.degree[0] : errors.degree}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              { t.dashboard.sections.educations.education.startDate }{" "}
                              <span className="text-slate-400 font-normal text-xs">
                                ({ t.dashboard.sections.educations.education.startDateHint })
                              </span>
                            </label>
                            <input
                              type="date"
                              value={education.start_date}
                              onChange={(e) =>
                                setEducation(
                                  {...education, start_date :e.target.value}
                                  
                                )
                              }
                              className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              { t.dashboard.sections.educations.education.endDate }{" "}
                              <span className="text-slate-400 font-normal text-xs">
                                ({ t.dashboard.sections.educations.education.endDateHint })
                              </span>
                            </label>
                            <input
                              type="date"
                              value={education.end_date}
                              onChange={(e) =>
                                setEducation(
                                  {...education, end_date :e.target.value}
                                  
                                )
                              }
                              className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm px-4 py-3"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            { t.dashboard.sections.educations.education.description }{" "}
                            <span className="text-slate-400 font-normal text-xs">
                              ({ t.dashboard.sections.educations.education.descriptionHint })
                            </span>
                          </label>
                          <textarea
                            rows={4}
                            value={education.description}
                            onChange={(e) =>
                                setEducation(
                                  {...education, description :e.target.value}
                                  
                                )
                              }
                            className="w-full rounded-xl border-slate-300 bg-white shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-sm p-4 resize-none"
                            placeholder={ t.dashboard.sections.educations.education.descriptionPlaceholder }
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={ ()=> { !edit ? handleStoreEducation(index) : handleUpdateEducation(index) } } 
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
