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
      console.error('Error fetching blog posts:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (editDialog.post) {
        response = await updateBlogPost(editDialog.post.id, formData);
        toast.success(blog.updateSuccess || 'Blog post updated successfully');
      } else {
        response = await createBlogPost(formData);
        toast.success(blog.createSuccess || 'Blog post created successfully');
      }

      if (response.data.status) {
        setNewPostDialog(false);
        setEditDialog({ isOpen: false, post: null });
        resetForm();
        fetchPosts();
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
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
      console.error('Error deleting blog post:', error);
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {blog.title || "Blog Management"}
            </h1>
            <p className="text-gray-600 mt-1">
              {blog.subtitle || "Create and manage blog posts"}
            </p>
          </div>
          <button
            onClick={openNewDialog}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            {blog.newPost || "New Post"}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={blog.searchPlaceholder || "Search posts..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{blog.allStatus || "All Status"}</option>
            <option value="published">{blog.published || "Published"}</option>
            <option value="draft">{blog.draft || "Draft"}</option>
          </select>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{blog.noPosts || "No blog posts found"}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.title || "Title"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.author || "Author"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.status || "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.publishedAt || "Published At"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.views || "Views"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {blog.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-gray-500 truncate max-w-md">{post.excerpt}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.user?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? (blog.published || "Published") : (blog.draft || "Draft")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.published_at ? formatDate(post.published_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title={blog.view || "View"}
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditDialog(post)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={blog.edit || "Edit"}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, post })}
                          className="text-red-600 hover:text-red-900"
                          title={blog.delete || "Delete"}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New/Edit Post Dialog */}
        {(newPostDialog || editDialog.isOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {blog.titleLabel || "Title"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {blog.excerptLabel || "Excerpt"}
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={blog.excerptPlaceholder || "Brief summary of the post..."}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {blog.contentLabel || "Content"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={blog.contentPlaceholder || "Write your blog post content here (HTML supported)..."}
                  />
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {blog.featuredImageLabel || "Featured Image URL"}
                  </label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {blog.statusLabel || "Status"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">{blog.draft || "Draft"}</option>
                      <option value="published">{blog.published || "Published"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {blog.publishedAtLabel || "Published At"}
                    </label>
                    <input
                      type="datetime-local"
                      name="published_at"
                      value={formData.published_at}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPostDialog(false);
                      setEditDialog({ isOpen: false, post: null });
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {blog.cancel || "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {blog.saving || "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
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
      </div>
    </AdminLayout>
  );
}

