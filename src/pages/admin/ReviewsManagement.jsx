import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Trash2, 
    Eye, 
    EyeOff, 
    Star, 
    User, 
    Calendar,
    MessageSquare,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { getAdminReviews, toggleReviewPublic, deleteReview } from '../../services/adminReviewService';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

export default function ReviewsManagement() {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);
    const [isToggling, setIsToggling] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [search]);

    const fetchReviews = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await getAdminReviews({ page, search, per_page: 10 });
            if (response.data.status) {
                setReviews(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePublic = async (reviewId) => {
        try {
            setIsToggling(reviewId);
            const response = await toggleReviewPublic(reviewId);
            if (response.data.status) {
                setReviews(prev => prev.map(r => 
                    r.id === reviewId ? { ...r, is_public: !r.is_public } : r
                ));
                toast.success('Review visibility updated');
            }
        } catch (error) {
            console.error('Error toggling review:', error);
            toast.error('Failed to update visibility');
        } finally {
            setIsToggling(null);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(reviewId);
            const response = await deleteReview(reviewId);
            if (response.data.status) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
                toast.success('Review deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews Management</h1>
                        <p className="text-gray-600">Manage customer feedback and success stories</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Reviews Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                            <p className="font-medium">Loading reviews...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Rating</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={review.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name}`}
                                                        alt=""
                                                        className="h-9 w-9 rounded-full ring-2 ring-white"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{review.user?.name}</div>
                                                        <div className="text-xs text-gray-500">{review.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs xl:max-w-md">
                                                    <div className="text-sm font-bold text-gray-900 mb-1">{review.title}</div>
                                                    <div className="text-sm text-gray-600 line-clamp-2">{review.comment}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">
                                                    <Star className="h-3.5 w-3.5 fill-current mr-1" />
                                                    <span className="text-sm font-bold">{review.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTogglePublic(review.id)}
                                                    disabled={isToggling === review.id}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all ${
                                                        review.is_public
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    } ${isToggling === review.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isToggling === review.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                    ) : review.is_public ? (
                                                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3 mr-1.5" />
                                                    )}
                                                    {review.is_public ? 'Public' : 'Hidden'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                    {formatDate(review.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleDelete(review.id)}
                                                        disabled={isDeleting === review.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete review"
                                                    >
                                                        {isDeleting === review.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500 bg-gray-50/30">
                            <MessageSquare className="h-16 w-16 text-gray-200 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No reviews found</h3>
                            <p className="max-w-xs text-center">Try adjusting your search criteria or check back later for new reviews.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">
                                Showing {reviews.length} of {pagination.total} reviews
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchReviews(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchReviews(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-4 py-2 border border-blue-100 rounded-lg text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
