import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { Calendar, User, ArrowLeft, Eye, Loader2, FileText } from 'lucide-react';
import { getBlogPost } from '../services/blogService';
import { useLanguage } from '../context/LanguageContext';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const blog = t?.blog || {};
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBlogPost(slug);
      
      if (response.data.status) {
        setPost(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Blog post not found');
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </GuestLayout>
    );
  }

  if (error || !post) {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {blog.notFound || "Blog Post Not Found"}
              </h1>
              <p className="text-gray-600 mb-6">
                {error || blog.notFoundMessage || "The blog post you're looking for doesn't exist."}
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {blog.backToBlog || "Back to Blog"}
              </Link>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {blog.backToBlog || "Back to Blog"}
          </Link>

          {/* Article */}
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {post.featured_image && (
              <div className="aspect-video w-full overflow-hidden bg-gray-200">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-5 w-5" />
                  <span>{post.user?.name || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-5 w-5" />
                  <span>{post.views || 0} {blog.views || "views"}</span>
                </div>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-700 mb-8 font-medium">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>
      </div>
    </GuestLayout>
  );
}

