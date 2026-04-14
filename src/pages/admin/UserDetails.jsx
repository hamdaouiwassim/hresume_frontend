import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../Layouts/AdminLayout';
import { getAdminUser, sendAdminUserMessage } from '../../services/adminService';
import { toast } from 'sonner';
import { 
    Loader2, 
    ArrowLeft, 
    Mail, 
    Calendar, 
    Shield, 
    Briefcase, 
    FileText, 
    User, 
    Building2,
    CheckCircle,
    XCircle,
    Globe,
    Phone,
    Linkedin,
    Clock
} from 'lucide-react';

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailForm, setEmailForm] = useState({
        subject: '',
        message: '',
    });

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await getAdminUser(id);
            if (response.data.status) {
                setUser(response.data.data);
            } else {
                toast.error('Failed to load user details');
                navigate('/admin/users');
            }
        } catch (error) {
            toast.error('Failed to load user details');
            navigate('/admin/users');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const timeAgo = (dateString) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
            return formatDate(dateString);
        } catch (error) {
            return 'N/A';
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center min-h-[600px]">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading user details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return null;
    }

    const userAvatar =
        user.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.name || 'user')}`;

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">User Details</h1>
                                <p className="text-gray-600">View comprehensive information about this user</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info Card */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* User Profile Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-start space-x-6">
                                    <img
                                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.email}
                                        alt={user.name}
                                        className="h-24 w-24 rounded-full border-4 border-purple-200"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                            <div className="flex items-center gap-2">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Joined: {formatDate(user.created_at)}
                                            </div>
                                            {user.last_activity && (
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Last active: {timeAgo(user.last_activity)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Roles & Status Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Roles & Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">Admin</span>
                                            {user.is_admin ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">No</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">Recruiter</span>
                                            {user.is_recruiter ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                                                    <Briefcase className="h-3 w-3 mr-1" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">No</span>
                                            )}
                                        </div>
                                        {user.recruiter_status && (
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                                    user.recruiter_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    user.recruiter_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {user.recruiter_status.charAt(0).toUpperCase() + user.recruiter_status.slice(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recruiter Details */}
                            {user.recruiter && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recruiter Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {user.company_name && (
                                            <div>
                                                <div className="flex items-center text-gray-600 mb-1">
                                                    <Building2 className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">Company</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{user.company_name}</p>
                                            </div>
                                        )}
                                        {user.company_size && (
                                            <div>
                                                <div className="flex items-center text-gray-600 mb-1">
                                                    <User className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">Company Size</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{user.company_size}</p>
                                            </div>
                                        )}
                                        {user.industry_focus && (
                                            <div>
                                                <div className="flex items-center text-gray-600 mb-1">
                                                    <Briefcase className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">Industry</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{user.industry_focus}</p>
                                            </div>
                                        )}
                                        {user.recruiter_phone && (
                                            <div>
                                                <div className="flex items-center text-gray-600 mb-1">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">Phone</span>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{user.recruiter_phone}</p>
                                            </div>
                                        )}
                                        {user.recruiter_linkedin && (
                                            <div className="md:col-span-2">
                                                <div className="flex items-center text-gray-600 mb-1">
                                                    <Linkedin className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">LinkedIn</span>
                                                </div>
                                                <a 
                                                    href={user.recruiter_linkedin} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                                >
                                                    {user.recruiter_linkedin}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recent Resumes */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Resumes</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600">Total: {user.resumes_count || 0}</span>
                                        {user.resumes_count > 0 && (
                                            <Link
                                                to={`/admin/users/${user.id}/cvs`}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 text-sm font-semibold flex items-center"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                View All CVs
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {user.resumes && user.resumes.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.resumes.map((resume) => (
                                            <Link
                                                key={resume.id}
                                                to={`/admin/resumes/${resume.id}`}
                                                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{resume.name}</p>
                                                        {resume.template && (
                                                            <p className="text-sm text-gray-500">Template: {resume.template.name}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">{formatDate(resume.updated_at)}</p>
                                                        <FileText className="h-4 w-4 text-gray-400 mt-1 ml-auto" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No resumes found</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Profile Photo */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Photo</h3>
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative w-full">
                                        <div className="mx-auto h-56 w-56 rounded-[2.25rem] overflow-hidden border-4 border-purple-100 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
                                            <img
                                                src={userAvatar}
                                                alt={user.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <span className="absolute -bottom-3 right-6 px-3 py-1 text-xs font-semibold rounded-full bg-white shadow text-gray-600 border border-gray-100">
                                            ID #{user.id}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">
                                        {user.avatar ? 'Uploaded avatar' : 'Auto-generated fallback'}
                                    </p>
                                    <div className="mt-4 w-full space-y-2 text-sm">
                                        <div className="flex items-center justify-between text-gray-500">
                                            <span>Last update</span>
                                            <span className="font-semibold text-gray-900">
                                                {formatDate(user.updated_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-gray-500">
                                            <span>Status</span>
                                            <span className="font-semibold text-gray-900">
                                                {user.email_verified_at ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-600">
                                            <FileText className="h-5 w-5 mr-2" />
                                            <span>Resumes</span>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{user.resumes_count || 0}</span>
                                    </div>
                                    {user.resumes_count > 0 && (
                                        <Link
                                            to={`/admin/users/${user.id}/cvs`}
                                            className="block w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 text-sm font-semibold text-center"
                                        >
                                            View All CVs
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Message User */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Send Message</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Reach out to {user.name} directly. This will send an email from your admin account.
                                </p>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!emailForm.subject.trim() || !emailForm.message.trim()) {
                                            toast.error('Subject and message are required.');
                                            return;
                                        }
                                        try {
                                            setIsSendingEmail(true);
                                            await sendAdminUserMessage(user.id, emailForm);
                                            toast.success('Email queued successfully.');
                                            setEmailForm({ subject: '', message: '' });
                                        } catch (error) {
                                            toast.error(error?.response?.data?.message || 'Failed to send email.');
                                        } finally {
                                            setIsSendingEmail(false);
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email-subject">
                                            Subject
                                        </label>
                                        <input
                                            id="email-subject"
                                            type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                            value={emailForm.subject}
                                            onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Subject line"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email-body">
                                            Message
                                        </label>
                                        <textarea
                                            id="email-body"
                                            rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                            value={emailForm.message}
                                            onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))}
                                            placeholder="Write your message..."
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSendingEmail}
                                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold transition ${
                                            isSendingEmail
                                                ? 'bg-slate-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30'
                                        }`}
                                    >
                                        {isSendingEmail ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Email'
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">User ID:</span>
                                        <p className="text-gray-900 font-semibold">#{user.id}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email Verified:</span>
                                        <p className="text-gray-900 font-semibold">
                                            {user.email_verified_at ? formatDate(user.email_verified_at) : 'Not verified'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Created:</span>
                                        <p className="text-gray-900 font-semibold">{formatDate(user.created_at)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Last Updated:</span>
                                        <p className="text-gray-900 font-semibold">{formatDate(user.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

