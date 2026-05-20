import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Layouts/AdminLayout';
import { FileText, Search, Plus, Edit2, Trash2, Loader2, Eye } from 'lucide-react';
import { getAdminBlogPosts, deleteBlogPost } from '../../services/blogService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../context/LanguageContext';
import AdminListPagination from '../../components/admin/AdminListPagination';
import { DEFAULT_ADMIN_PER_PAGE } from '../../constants/adminPagination';

export default function AdminBlog() {
  const { t } = useLanguage();
  const blog = t?.admin?.blog || {};

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, post: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [perPage, setPerPage] = useState(DEFAULT_ADMIN_PER_PAGE);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    fetchPosts(1);
  }, [searchQuery, statusFilter, perPage]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page: pageNum,
        per_page: perPage,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const response = await getAdminBlogPosts(params);
      if (response.data.status) {
        const data = response.data.data;
        setPosts(data.data || []);
        setPagination({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
        });
        setPage(data.current_page ?? pageNum);
      } else {
        toast.error(blog.fetchError || 'Failed to load blog posts');
      }
    } catch {
      toast.error(blog.fetchError || 'Failed to load blog posts');
    } finally {
      setIsLoading(false);
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
        fetchPosts(page);
      }
    } catch {
      toast.error(blog.deleteError || 'Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-slide-in">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {blog.title || 'Blog Management'}
                </h1>
                <p className="text-gray-600">
                  {blog.subtitle || 'Create and manage blog posts'}
                </p>
              </div>
              <Link
                to="/admin/blog/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" />
                {blog.newPost || 'New Post'}
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={blog.searchPlaceholder || 'Search posts by title or excerpt...'}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
              >
                <option value="all">{blog.allStatus || 'All Status'}</option>
                <option value="published">{blog.published || 'Published'}</option>
                <option value="draft">{blog.draft || 'Draft'}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[600px]">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-6">{blog.noPosts || 'No blog posts found'}</p>
              <Link
                to="/admin/blog/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
              >
                <Plus className="h-5 w-5 mr-2" />
                {blog.newPost || 'New Post'}
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.titleColumn || blog.titleLabel || 'Title'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.author || 'Author'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.status || 'Status'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.publishedAt || 'Published At'}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.views || 'Views'}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {blog.actions || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-md mt-1">
                              {post.excerpt}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{post.user?.name || 'Admin'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {post.status === 'published'
                              ? blog.published || 'Published'
                              : blog.draft || 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {post.published_at ? (
                            formatDate(post.published_at)
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
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
                                title={blog.view || 'View'}
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            )}
                            <Link
                              to={`/admin/blog/edit/${post.id}`}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title={blog.edit || 'Edit'}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteDialog({ isOpen: true, post })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={blog.delete || 'Delete'}
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
              {!isLoading && pagination.total > 0 && (
                <AdminListPagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_page}
                  perPage={perPage}
                  total={pagination.total}
                  onPageChange={(p) => fetchPosts(p)}
                  onPerPageChange={setPerPage}
                  itemLabel="posts"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, post: null })}
        onConfirm={handleDelete}
        title={blog.deleteConfirmTitle || 'Delete Blog Post'}
        message={
          blog.deleteConfirmMessage ||
          'Are you sure you want to delete this blog post? This action cannot be undone.'
        }
        confirmText={blog.delete || 'Delete'}
        cancelText={blog.cancel || 'Cancel'}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}
