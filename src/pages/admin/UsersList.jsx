import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Users, Search, Trash2, Loader2, Shield, Calendar, Mail, FileText, Briefcase, Building2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getAdminUsers, deleteAdminUser, updateAdminUser } from '../../services/adminService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UsersList() {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const role = params.get('role') || '';
        setRoleFilter(role);
    }, [location.search]);

    useEffect(() => {
        fetchUsers();
    }, [searchQuery, roleFilter, verificationFilter]);

    const fetchUsers = async (page = 1) => {
        try {
            setIsLoading(true);
            const params = {
                per_page: 15,
                page: page,
                ...(searchQuery && { search: searchQuery }),
                ...(roleFilter && { role: roleFilter }),
                ...(verificationFilter && { verification_status: verificationFilter })
            };
            const response = await getAdminUsers(params);
            if (response.data.status) {
                // Handle both paginated and non-paginated responses
                const data = response.data.data;
                const usersList = data.data || data || [];
                setUsers(usersList);

                // Pagination info
                if (data.current_page !== undefined) {
                    setPagination({
                        current_page: data.current_page || 1,
                        last_page: data.last_page || 1,
                        per_page: data.per_page || 15,
                        total: data.total || usersList.length
                    });
                } else {
                    setPagination({
                        current_page: 1,
                        last_page: 1,
                        per_page: usersList.length || 15,
                        total: usersList.length
                    });
                }
            } else {
                toast.error('Failed to load users');
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (user) => {
        setDeleteDialog({ isOpen: true, user });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.user) return;

        setIsDeleting(true);
        try {
            await deleteAdminUser(deleteDialog.user.id);
            toast.success('User deleted successfully');
            setUsers(users.filter(u => u.id !== deleteDialog.user.id));
            setDeleteDialog({ isOpen: false, user: null });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleAdmin = async (user) => {
        try {
            await updateAdminUser(user.id, { is_admin: !user.is_admin });
            toast.success(`User ${!user.is_admin ? 'promoted to' : 'demoted from'} admin`);
            fetchUsers(pagination.current_page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const toggleRecruiter = async (user) => {
        try {
            const activating = user.recruiter_status !== 'approved';
            await updateAdminUser(user.id, { is_recruiter: activating });
            toast.success(
                activating
                    ? 'Recruiter access approved'
                    : 'Recruiter access revoked'
            );
            fetchUsers(pagination.current_page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            const locale = language === 'fr' ? 'fr-FR' : 'en-US';
            return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
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
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return formatDate(dateString);
        } catch (error) {
            return 'N/A';
        }
    };

    if (isLoading && users.length === 0) {
        return (
            <AdminLayout>
                <div className="bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 animate-slide-in">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Management</h1>
                        <p className="text-gray-600">Manage all users and their activity</p>
                    </div>

                    {/* Search Bar and Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Role Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Role:</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        if (e.target.value) {
                                            navigate(`/admin/users?role=${e.target.value}`);
                                        } else {
                                            navigate('/admin/users');
                                        }
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                                >
                                    <option value="">All Roles</option>
                                    <option value="candidate">Candidate</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Verification Status Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Verification:</label>
                                <select
                                    value={verificationFilter}
                                    onChange={(e) => setVerificationFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                                >
                                    <option value="">All</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            {(roleFilter || verificationFilter) && (
                                <button
                                    onClick={() => {
                                        setRoleFilter('');
                                        setVerificationFilter('');
                                        navigate('/admin/users');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {(roleFilter || verificationFilter) && (
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-semibold text-gray-600">Active filters:</span>
                                {roleFilter && (
                                    <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 capitalize">
                                        Role: {roleFilter}
                                    </span>
                                )}
                                {verificationFilter && (
                                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                                        Verification: {verificationFilter}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Recruiter Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Resumes</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Activity</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                                        alt={user.name}
                                                        className="h-10 w-10 rounded-full border-2 border-purple-200 mr-3"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {user.is_admin && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Admin
                                                        </span>
                                                    )}
                                                    {user.is_recruiter && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            Recruiter
                                                        </span>
                                                    )}
                                                    {!user.is_admin && !user.is_recruiter && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                            User
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.recruiter_status ? (
                                                    <div className="space-y-1">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.recruiter_status === 'approved'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : user.recruiter_status === 'pending'
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-rose-100 text-rose-700'
                                                                }`}
                                                        >
                                                            {user.recruiter_status.charAt(0).toUpperCase() + user.recruiter_status.slice(1)}
                                                        </span>
                                                        {user.company_name && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Building2 className="h-3 w-3" />
                                                                {user.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                                    {user.resumes_count || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{timeAgo(user.last_activity)}</div>
                                                {user.last_activity && (
                                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {formatDate(user.last_activity)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="View user details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleAdmin(user)}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_admin
                                                                ? 'text-purple-600 hover:bg-purple-50'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRecruiter(user)}
                                                        className={`p-2 rounded-lg transition-colors ${user.recruiter_status === 'approved'
                                                                ? 'text-sky-600 hover:bg-sky-50'
                                                                : user.recruiter_status === 'pending'
                                                                    ? 'text-amber-600 hover:bg-amber-50'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        title={
                                                            user.recruiter_status === 'approved'
                                                                ? 'Revoke recruiter access'
                                                                : 'Approve recruiter access'
                                                        }
                                                    >
                                                        <Briefcase className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={isDeleting}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete user"
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

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} users
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.last_page}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {users.length === 0 && !isLoading && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-600">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, user: null })}
                onConfirm={confirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone. All associated resumes will also be deleted."
                itemName={deleteDialog.user?.name}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        </AdminLayout>
    );
}

