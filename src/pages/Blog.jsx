import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { Calendar, User, ArrowRight, Search, Loader2, FileText } from 'lucide-react';
import { getBlogPosts } from '../services/blogService';
import { useLanguage } from '../context/LanguageContext';

export default function Blog() {
  const { t } = useLanguage();
  const blog = t?.blog || {};
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = {
        per_page: 12,
        page: currentPage,
      };
      
      // Only add search parameter if it has a value
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const response = await getBlogPosts(params);
      
      if (response.data.status) {
        setPosts(response.data.data.data || []);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
        });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {blog.title || "Blog"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {blog.subtitle || "Stay updated with the latest tips, insights, and news about resume building and career development."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={blog.searchPlaceholder || "Search blog posts..."}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {blog.noPosts || "No blog posts found."}
              </p>
            </div>
          ) : (
            <>
              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {post.featured_image && (
                      <div className="aspect-video w-full overflow-hidden bg-gray-200">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.user?.name || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {blog.previous || "Previous"}
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    {blog.page || "Page"} {currentPage} {blog.of || "of"} {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                    disabled={currentPage === pagination.last_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {blog.next || "Next"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}

