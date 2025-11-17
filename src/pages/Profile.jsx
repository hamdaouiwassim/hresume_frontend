import { useState, useEffect, useContext } from "react";
import AuthLayout from "../Layouts/AuthLayout";
import { Camera, Save, User, Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { updateProfile, getProfile } from "../services/profileService";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { t } = useLanguage();
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    avatarFile: null, // Store the file object for upload
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await getProfile();
      if (response.data.status) {
        const userData = response.data.user;
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          avatar: userData.avatar || "",
          avatarFile: null,
          password: "",
          password_confirmation: "",
        });
        setUser(userData);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsChanged(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Store the file object and create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      avatarFile: file, // Store the file object
      avatar: previewUrl, // Store preview URL for display
    }));
    setIsChanged(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = ["Name is required"];
    }
    
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = ["Email is required"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ["Please enter a valid email address"];
    }

    // Password validation (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = ["Password must be at least 8 characters"];
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = ["Passwords do not match"];
      }
    }

    return newErrors;
  };

  const hasValidationErrors = () => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length > 0 || Object.keys(errors).length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      
      // Only append avatar file if a new one was selected
      if (formData.avatarFile) {
        console.log("Appending avatar file:", {
          file: formData.avatarFile,
          name: formData.avatarFile.name,
          size: formData.avatarFile.size,
          type: formData.avatarFile.type
        });
        formDataToSend.append("avatar", formData.avatarFile, formData.avatarFile.name);
      } else {
        console.log("No avatar file to append");
      }
      
      // Only append password if it's provided
      if (formData.password) {
        formDataToSend.append("password", formData.password);
        formDataToSend.append("password_confirmation", formData.password_confirmation);
      }

      // Debug: Log FormData contents
      console.log("FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await updateProfile(formDataToSend);
      
      if (response.data.status) {
        setUser(response.data.user);
        setFormData((prev) => ({
          ...prev,
          avatar: response.data.user.avatar || prev.avatar, // Update with server URL
          avatarFile: null, // Clear the file object
          password: "",
          password_confirmation: "",
        }));
        setIsChanged(false);
        toast.success("Profile updated successfully!");
        
        // Clean up preview URL if it was created
        if (formData.avatar && formData.avatar.startsWith('blob:')) {
          URL.revokeObjectURL(formData.avatar);
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <AuthLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <img
                    src={formData.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    title="Change avatar"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {formData.name || "Your Name"}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">{formData.email}</p>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Change Profile Picture
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Leave blank if you don't want to change your password
                </p>

                {/* New Password */}
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? "text" : "password"}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password_confirmation ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                {isChanged && (
                  <span className="flex items-center text-blue-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    You have unsaved changes
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={hasValidationErrors() || isLoading || !isChanged}
                className={`inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  hasValidationErrors() || isLoading || !isChanged
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}

