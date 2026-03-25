import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Layout, Search, Plus, Edit2, Trash2, Loader2, Eye, Save, X } from 'lucide-react';
import { getAdminTemplates, createAdminTemplate, updateAdminTemplate, deleteAdminTemplate } from '../../services/adminService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../context/LanguageContext';

export default function TemplatesManagement() {
    const { t, language } = useLanguage();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, template: null });
    const [editDialog, setEditDialog] = useState({ isOpen: false, template: null });
    const [newTemplateDialog, setNewTemplateDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Corporate',
        previewImageFile: null,
    });
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});

    const categories = ['All', 'Corporate', 'Creative', 'Simple'];

    useEffect(() => {
        fetchTemplates();
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const params = {
                per_page: 100,
                ...(searchQuery && { search: searchQuery }),
                ...(selectedCategory !== 'All' && { category: selectedCategory })
            };
            const response = await getAdminTemplates(params);
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
            await deleteAdminTemplate(deleteDialog.template.id);
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
            description: template.description || '',
            category: template.category || 'Corporate',
            previewImageFile: null,
        });
        setImagePreview(template.preview_image_url || '');
        setEditDialog({ isOpen: true, template });
        setErrors({});
    };

    const handleNew = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Corporate',
            previewImageFile: null,
        });
        setImagePreview('');
        setNewTemplateDialog(true);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.previewImageFile && !editDialog.isOpen) newErrors.preview_image = 'Preview image is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('category', formData.category);
            if (formData.previewImageFile) {
                payload.append('preview_image', formData.previewImageFile);
            }

            if (editDialog.isOpen && editDialog.template) {
                await updateAdminTemplate(editDialog.template.id, payload);
                toast.success('Template updated successfully');
                setEditDialog({ isOpen: false, template: null });
            } else {
                await createAdminTemplate(payload);
                toast.success('Template created successfully');
                setNewTemplateDialog(false);
            }
            setFormData({
                name: '',
                description: '',
                category: 'Corporate',
                previewImageFile: null,
            });
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview('');
            setErrors({});
            fetchTemplates();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Failed to save template');
        }
    };

    const getCategoryColor = (category) => {
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

    if (isLoading && templates.length === 0) {
        return (
            <AdminLayout>
                <div className="bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-slide-in">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Templates Management</h1>
                            <p className="text-gray-600">Manage all resume templates</p>
                        </div>
                        <button
                            onClick={handleNew}
                            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Template
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                            >
                                <div className="relative h-48 bg-gray-50 flex items-start justify-center p-4 overflow-hidden">
                                    {template.preview_image_url ? (
                                        <img
                                            src={template.preview_image_url}
                                            alt={template.name}
                                            className="max-h-full w-auto object-contain drop-shadow-md"
                                            onError={(e) => {
                                                e.target.src = `https://via.placeholder.com/800x1000/667eea/ffffff?text=${encodeURIComponent(template.name)}`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center rounded-xl">
                                            <span className="text-white text-xl font-bold">{template.name}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(template.category)}`}>
                                            {template.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {template.description || 'No description'}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(template)}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template)}
                                            disabled={isDeleting}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {templates.length === 0 && !isLoading && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-600">No templates found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New/Edit Template Modal */}
            {(newTemplateDialog || editDialog.isOpen) && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
                    onClick={() => {
                        setNewTemplateDialog(false);
                        setEditDialog({ isOpen: false, template: null });
                    }}
                >
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editDialog.isOpen ? 'Edit Template' : 'New Template'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setNewTemplateDialog(false);
                                        setEditDialog({ isOpen: false, template: null });
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: null });
                                        }}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="e.g., Modern Professional"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Describe the template..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, category: e.target.value });
                                            if (errors.category) setErrors({ ...errors, category: null });
                                        }}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="Corporate">Corporate</option>
                                        <option value="Creative">Creative</option>
                                        <option value="Simple">Simple</option>
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preview Image {editDialog.isOpen ? '(optional)' : '*'}
                                    </label>
                                    <div className="space-y-3">
                                        <div className="relative w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-start justify-center p-4">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Template preview"
                                                    className="max-h-56 w-auto object-contain drop-shadow-md"
                                                />
                                            ) : (
                                                <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                                                    No image selected
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                if (imagePreview && imagePreview.startsWith('blob:')) {
                                                    URL.revokeObjectURL(imagePreview);
                                                }
                                                setFormData((prev) => ({ ...prev, previewImageFile: file }));
                                                setImagePreview(
                                                    file
                                                        ? URL.createObjectURL(file)
                                                        : editDialog.template?.preview_image_url || ''
                                                );
                                                if (errors.preview_image) {
                                                    setErrors({ ...errors, preview_image: null });
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        {errors.preview_image && (
                                            <p className="text-sm text-red-600">{errors.preview_image}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Accepted formats: JPG, PNG. Max size 2MB.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewTemplateDialog(false);
                                            setEditDialog({ isOpen: false, template: null });
                                        }}
                                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="h-4 w-4 inline mr-2" />
                                        {editDialog.isOpen ? 'Update' : 'Create'} Template
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, template: null })}
                onConfirm={confirmDelete}
                title="Delete Template"
                message="Are you sure you want to delete this template? This action cannot be undone."
                itemName={deleteDialog.template?.name}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        </AdminLayout>
    );
}

