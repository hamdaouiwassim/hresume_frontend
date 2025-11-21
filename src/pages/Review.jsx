import { useState, useEffect } from 'react';
import AuthLayout from "../Layouts/AuthLayout";
import { Star, MessageSquare, Send, Loader2, CheckCircle, Heart, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { submitReview, getUserReview } from '../services/reviewService';
import { toast } from 'sonner';

export default function Review() {
  const { t } = useLanguage();
  const review = t?.review || {};
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    is_public: true
  });
  
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchUserReview();
  }, []);

  const fetchUserReview = async () => {
    try {
      setIsLoading(true);
      const response = await getUserReview();
      if (response.data.status && response.data.data) {
        const reviewData = response.data.data;
        setExistingReview(reviewData);
        setFormData({
          rating: reviewData.rating || 0,
          title: reviewData.title || '',
          comment: reviewData.comment || '',
          is_public: reviewData.is_public !== undefined ? reviewData.is_public : true
        });
      }
    } catch (error) {
      // User hasn't submitted a review yet, which is fine
      if (error.response?.status !== 404) {
        console.error('Error fetching review:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.rating === 0) {
      newErrors.rating = review.validation?.ratingRequired || "Please select a rating";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = review.validation?.titleRequired || "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = review.validation?.titleMinLength || "Title must be at least 3 characters";
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = review.validation?.commentRequired || "Review comment is required";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = review.validation?.commentMinLength || "Review must be at least 10 characters";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if review already exists
    if (existingReview) {
      toast.info(review.alreadySubmittedMessage || "You have already submitted a review.");
      return;
    }
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const response = await submitReview(formData);
      
      if (response.data.status) {
        setSubmitSuccess(true);
        setExistingReview(response.data.data);
        toast.success(review.successMessage || "Thank you for your review!");
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || review.errorMessage || "Failed to submit review. Please try again.");
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {review.title || "Share Your Experience"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {review.subtitle || "Your feedback helps us improve and helps others discover HResume. We'd love to hear about your experience!"}
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-green-800 font-semibold mb-1">
                  {review.successTitle || "Thank You!"}
                </h3>
                <p className="text-green-700">
                  {review.successDescription || "Your review has been submitted successfully. We appreciate your feedback!"}
                </p>
              </div>
            </div>
          )}

          {/* Already Submitted Message */}
          {existingReview && !submitSuccess && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-blue-800 font-semibold mb-1">
                  {review.alreadySubmittedTitle || "Review Already Submitted"}
                </h3>
                <p className="text-blue-700">
                  {review.alreadySubmittedMessage || "You have already submitted a review. Thank you for your feedback!"}
                </p>
              </div>
            </div>
          )}

          {/* Review Form - Show read-only if review exists */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {review.ratingLabel || "How would you rate your experience?"} 
                  {!existingReview && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    existingReview ? (
                      <Star
                        key={star}
                        className={`h-12 w-12 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ) : (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-12 w-12 ${
                            star <= (hoveredRating || formData.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    )
                  ))}
                  {formData.rating > 0 && (
                    <span className="ml-4 text-lg font-semibold text-gray-700">
                      {formData.rating === 5 && (review.ratingLabels?.excellent || "Excellent")}
                      {formData.rating === 4 && (review.ratingLabels?.veryGood || "Very Good")}
                      {formData.rating === 3 && (review.ratingLabels?.good || "Good")}
                      {formData.rating === 2 && (review.ratingLabels?.fair || "Fair")}
                      {formData.rating === 1 && (review.ratingLabels?.poor || "Poor")}
                    </span>
                  )}
                </div>
                {errors.rating && (
                  <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
                )}
              </div>

              {/* Title Section */}
              <div>
                <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-2">
                  {review.titleLabel || "Review Title"} 
                  {!existingReview && <span className="text-red-500">*</span>}
                </label>
                {existingReview ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {formData.title || review.noTitle || "No title provided"}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={review.titlePlaceholder || "e.g., Great platform for creating resumes"}
                      maxLength={100}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.title.length}/100 {review.characters || "characters"}
                    </p>
                  </>
                )}
              </div>

              {/* Comment Section */}
              <div>
                <label htmlFor="comment" className="block text-lg font-semibold text-gray-900 mb-2">
                  {review.commentLabel || "Your Review"} 
                  {!existingReview && <span className="text-red-500">*</span>}
                </label>
                {existingReview ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[150px] whitespace-pre-wrap">
                    {formData.comment || review.noComment || "No comment provided"}
                  </div>
                ) : (
                  <>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                        errors.comment ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={review.commentPlaceholder || "Tell us about your experience with HResume. What did you like? What could be improved?"}
                    />
                    {errors.comment && (
                      <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.comment.length} {review.characters || "characters"} ({review.minCharacters || "minimum 10"})
                    </p>
                  </>
                )}
              </div>

              {/* Public Toggle */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                {existingReview ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      formData.is_public ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {formData.is_public && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.is_public 
                          ? (review.publicStatus || "This review is public")
                          : (review.privateStatus || "This review is private")
                        }
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {review.publicDescription || "Allow others to see your review on our platform. You can change this later."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      id="is_public"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <label htmlFor="is_public" className="text-sm font-medium text-gray-900 cursor-pointer">
                        {review.publicLabel || "Make this review public"}
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        {review.publicDescription || "Allow others to see your review on our platform. You can change this later."}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button - Only show if no existing review */}
              {!existingReview && (
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {review.submitting || "Submitting..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {review.submitButton || "Submit Review"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Encouragement Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <ThumbsUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {review.encouragementTitle || "Your Review Matters!"}
                    </h3>
                    <p className="text-gray-700">
                      {review.encouragementText || "By sharing your experience, you're helping us improve HResume and helping other job seekers discover a great tool for creating professional resumes. Thank you for taking the time!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

