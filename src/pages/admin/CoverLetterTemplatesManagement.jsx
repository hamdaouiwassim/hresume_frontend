import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Search, Plus, Edit2, Trash2, Loader2, Save, X, FileText, Globe } from 'lucide-react';
import { getAdminCoverLetterTemplates, createAdminCoverLetterTemplate, updateAdminCoverLetterTemplate, deleteAdminCoverLetterTemplate } from '../../services/adminService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../context/LanguageContext';

export default function CoverLetterTemplatesManagement() {
    const { t, language } = useLanguage();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, template: null });
    const [editDialog, setEditDialog] = useState({ isOpen: false, template: null });
    const [newTemplateDialog, setNewTemplateDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        job_type: '',
        language: 'en',
        subject: '',
        content: '',
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchTemplates();
    }, [searchQuery, selectedLanguage]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const params = {
                per_page: 100,
                ...(searchQuery && { search: searchQuery }),
                ...(selectedLanguage !== 'All' && { language: selectedLanguage })
            };
            const response = await getAdminCoverLetterTemplates(params);
            if (response.data.status) {
                setTemplates(response.data.data.data || []);
            } else {
                toast.error('Failed to load templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (template) => {
        setDeleteDialog({ isOpen: true, template });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.template) return;

        setIsDeleting(true);
        try {
            await deleteAdminCoverLetterTemplate(deleteDialog.template.id);
            toast.success('Template deleted successfully');
            setTemplates(templates.filter(t => t.id !== deleteDialog.template.id));
            setDeleteDialog({ isOpen: false, template: null });
        } catch (error) {
            console.error("Error deleting template:", error);
            toast.error(error.response?.data?.message || 'Failed to delete template');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (template) => {
        setFormData({
            name: template.name || '',
            job_type: template.job_type || '',
            language: template.language || 'en',
            subject: template.subject || '',
            content: template.content || '',
            is_active: template.is_active ?? true
        });
        setEditDialog({ isOpen: true, template });
        setErrors({});
    };

    const handleNew = () => {
        setFormData({
            name: '',
            job_type: '',
            language: language === 'fr' ? 'fr' : 'en',
            subject: '',
            content: '',
            is_active: true
        });
        setNewTemplateDialog(true);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editDialog.isOpen && editDialog.template) {
                await updateAdminCoverLetterTemplate(editDialog.template.id, formData);
                toast.success('Template updated successfully');
                setEditDialog({ isOpen: false, template: null });
            } else {
                await createAdminCoverLetterTemplate(formData);
                toast.success('Template created successfully');
                setNewTemplateDialog(false);
            }
            fetchTemplates();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && templates.length === 0) {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cover Letter Templates</h1>
                        <p className="text-slate-600">Manage professional templates for users</p>
                    </div>
                    <button
                        onClick={handleNew}
                        className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Template
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All', 'en', 'fr'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedLanguage === lang
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                {lang === 'All' ? 'All Languages' : lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Language</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {templates.map((template) => (
                                <tr key={template.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{template.name}</h3>
                                                <p className="text-xs text-slate-500 truncate max-w-xs">{template.subject}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600">{template.job_type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 lowercase">
                                            <Globe className="h-4 w-4" />
                                            {template.language}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {template.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Template"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Template"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {templates.length === 0 && !isLoading && (
                        <div className="p-12 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No templates found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {(newTemplateDialog || editDialog.isOpen) && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editDialog.isOpen ? 'Edit Template' : 'New Cover Letter Template'}
                            </h2>
                            <button
                                onClick={() => {
                                    setNewTemplateDialog(false);
                                    setEditDialog({ isOpen: false, template: null });
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., Software Engineer (English)"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type Identifier *</label>
                                    <input
                                        type="text"
                                        value={formData.job_type}
                                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g., software_engineer"
                                        required
                                    />
                                    {errors.job_type && <p className="mt-1 text-xs text-red-500">{errors.job_type[0]}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Language *</label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                                        required
                                    >
                                        <option value="en">English (EN)</option>
                                        <option value="fr">French (FR)</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">Active Template</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Subject Line *</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Application for [Position] - [Your Name]"
                                    required
                                />
                                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Template Content *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm"
                                    placeholder="Enter the template body text here..."
                                    required
                                />
                                {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content[0]}</p>}
                                <p className="mt-2 text-xs text-slate-400">Use placeholders like [Position], [Company Name], [Your Name], etc.</p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 bg-slate-50/50 p-6 -mx-6 -mb-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewTemplateDialog(false);
                                        setEditDialog({ isOpen: false, template: null });
                                    }}
                                    className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-white rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editDialog.isOpen ? 'Update Template' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, template: null })}
                onConfirm={confirmDelete}
                title="Delete Template"
                message={`Are you sure you want to delete "${deleteDialog.template?.name}"? This action cannot be undone.`}
                itemName={deleteDialog.template?.name}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        </AdminLayout>
    );
}
