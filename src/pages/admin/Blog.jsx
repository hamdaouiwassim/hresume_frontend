import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { FileText, Search, Plus, Edit2, Trash2, Loader2, Eye, Save, X, Calendar } from 'lucide-react';
import { getAdminBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../services/blogService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminBlog() {
  const { t } = useLanguage();
  const blog = t?.admin?.blog || {};

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, post: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, post: null });
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    published_at: '',
  });
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, statusFilter]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = {
        per_page: 50,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await getAdminBlogPosts(params);
      if (response.data.status) {
        setPosts(response.data.data.data || []);
      } else {
        toast.error(blog.fetchError || 'Failed to load blog posts');
      }
    } catch (error) {
      toast.error(blog.fetchError || 'Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = blog.validation?.titleRequired || 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = blog.validation?.contentRequired || 'Content is required';
    }
    return newErrors;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData if file is present, otherwise use regular data
      const submitData = featuredImageFile
        ? (() => {
          const formDataObj = new FormData();
          Object.keys(formData).forEach(key => {
            if (formData[key] !== '') {
              formDataObj.append(key, formData[key]);
            }
          });
          formDataObj.append('featured_image_file', featuredImageFile);
          return formDataObj;
        })()
        : formData;

      let response;
      if (editDialog.post) {
        response = await updateBlogPost(editDialog.post.id, submitData);
        toast.success(blog.updateSuccess || 'Blog post updated successfully');
      } else {
        response = await createBlogPost(submitData);
        toast.success(blog.createSuccess || 'Blog post created successfully');
      }

      if (response.data.status) {
        setNewPostDialog(false);
        setEditDialog({ isOpen: false, post: null });
        resetForm();
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        fetchPosts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || blog.saveError || 'Failed to save blog post');
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.post) return;

    setIsDeleting(true);
    try {
      const response = await deleteBlogPost(deleteDialog.post.id);
      if (response.data.status) {
        toast.success(blog.deleteSuccess || 'Blog post deleted successfully');
        setDeleteDialog({ isOpen: false, post: null });
        fetchPosts();
      }
    } catch (error) {
      toast.error(blog.deleteError || 'Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (post) => {
    setFormData({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      status: post.status || 'draft',
      published_at: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '',
    });
    setFeaturedImageFile(null);
    setFeaturedImagePreview(post.featured_image || null);
    setEditDialog({ isOpen: true, post });
    setErrors({});
  };

  const openNewDialog = () => {
    resetForm();
    setNewPostDialog(true);
    setEditDialog({ isOpen: false, post: null });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
      published_at: '',
    });
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-slide-in">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {blog.title || "Blog Management"}
                </h1>
                <p className="text-gray-600">
                  {blog.subtitle || "Create and manage blog posts"}
                </p>
              </div>
              <button
                onClick={openNewDialog}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" />
                {blog.newPost || "New Post"}
              </button>
            </div>
          </div>

          {/* Search Bar and Filters */}
          <div className="mb-6 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={blog.searchPlaceholder || "Search posts by title or excerpt..."}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
              >
                <option value="all">{blog.allStatus || "All Status"}</option>
                <option value="published">{blog.published || "Published"}</option>
                <option value="draft">{blog.draft || "Draft"}</option>
              </select>
            </div>
          </div>

          {/* Posts List */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[600px]">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">{blog.noPosts || "No blog posts found"}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.title || "Title"}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.author || "Author"}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.status || "Status"}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.publishedAt || "Published At"}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.views || "Views"}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.actions || "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-md mt-1">{post.excerpt}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{post.user?.name || 'Admin'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                            {post.status === 'published' ? (blog.published || "Published") : (blog.draft || "Draft")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.published_at ? formatDate(post.published_at) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700">
                            <Eye className="h-4 w-4 mr-2 text-gray-400" />
                            {post.views || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {post.status === 'published' && (
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={blog.view || "View"}
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => openEditDialog(post)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title={blog.edit || "Edit"}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, post })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={blog.delete || "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Post Dialog */}
      {(newPostDialog || editDialog.isOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editDialog.post ? (blog.editPost || "Edit Post") : (blog.newPost || "New Post")}
              </h2>
              <button
                onClick={() => {
                  setNewPostDialog(false);
                  setEditDialog({ isOpen: false, post: null });
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {blog.titleLabel || "Title"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {blog.excerptLabel || "Excerpt"}
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-y"
                  placeholder={blog.excerptPlaceholder || "Brief summary of the post..."}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {blog.contentLabel || "Content"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={12}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm transition-all duration-200 resize-y ${errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder={blog.contentPlaceholder || "Write your blog post content here (HTML supported)..."}
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {blog.featuredImageLabel || "Featured Image"}
                </label>

                {/* Image Preview */}
                {(featuredImagePreview || formData.featured_image) && (
                  <div className="mb-4 relative">
                    <img
                      src={featuredImagePreview || formData.featured_image}
                      alt="Featured preview"
                      className="max-w-full h-48 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImageFile(null);
                        setFeaturedImagePreview(null);
                        setFormData(prev => ({ ...prev, featured_image: '' }));
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {blog.imageUploadHint || "Upload an image (max 5MB) or use URL below"}
                  </p>
                </div>

                {/* URL Input (fallback) */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    {blog.orUseUrl || "Or use image URL:"}
                  </label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {blog.statusLabel || "Status"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-medium"
                  >
                    <option value="draft">{blog.draft || "Draft"}</option>
                    <option value="published">{blog.published || "Published"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {blog.publishedAtLabel || "Published At"}
                  </label>
                  <input
                    type="datetime-local"
                    name="published_at"
                    value={formData.published_at}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setNewPostDialog(false);
                    setEditDialog({ isOpen: false, post: null });
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  {blog.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {blog.saving || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {blog.save || "Save"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, post: null })}
        onConfirm={handleDelete}
        title={blog.deleteConfirmTitle || "Delete Blog Post"}
        message={blog.deleteConfirmMessage || "Are you sure you want to delete this blog post? This action cannot be undone."}
        confirmText={blog.delete || "Delete"}
        cancelText={blog.cancel || "Cancel"}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}

