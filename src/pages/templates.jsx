import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from "../Layouts/AuthLayout";
import { Eye, ArrowRight, X, Loader2, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTemplates } from '../services/resumeService';
import { toast } from 'sonner';

export default function Templates() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Corporate', 'Creative', 'Simple'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [selectedCategory, searchQuery, templates]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await getTemplates();
      if (response.data.status === 'success') {
        setTemplates(response.data.data);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (templateId) => {
    navigate(`/resume/new?template=${templateId}`);
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

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">{t.common.loading}</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse-slow" />
              <span className="text-blue-600 font-semibold">Professional Templates</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.templates.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.templates.subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {category === 'All' ? t.templates.allCategories : t.templates[category.toLowerCase()]}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 mb-4">No templates found</p>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term' : 'No templates in this category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    {template.preview_image_url ? (
                      <img
                        src={template.preview_image_url}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/800x1000/667eea/ffffff?text=${encodeURIComponent(template.name)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{template.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handlePreview(template)}
                        className="px-6 py-3 bg-white text-blue-600 rounded-xl flex items-center font-semibold transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        {t.templates.preview}
                      </button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {template.description || 'A professional template for your resume'}
                    </p>
                    <Link
                      to={`/resume/new?template=${template.id}`}
                      className="inline-flex items-center w-full justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      {t.templates.useTemplate}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(selectedTemplate.category)}`}>
                    {selectedTemplate.category}
                  </span>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedTemplate.preview_image_url ? (
                  <img
                    src={selectedTemplate.preview_image_url}
                    alt={selectedTemplate.name}
                    className="w-full rounded-lg shadow-lg mb-6"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/800x1000/667eea/ffffff?text=${encodeURIComponent(selectedTemplate.name)}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{selectedTemplate.name}</span>
                  </div>
                )}
                <p className="text-gray-600 text-lg mb-6">
                  {selectedTemplate.description || 'A professional template for your resume'}
                </p>
                <div className="flex gap-4">
                  <Link
                    to={`/resume/new?template=${selectedTemplate.id}`}
                    onClick={() => setShowPreview(false)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t.templates.useTemplate}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
