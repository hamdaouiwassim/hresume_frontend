import { useState, useEffect } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Users, Layout, FileText, Activity, Loader2, TrendingUp, Shield, Calendar } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await getDashboardStats();
            if (response.data.status) {
                setStats(response.data.data);
            } else {
                toast.error('Failed to load dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to load dashboard stats');
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
                month: 'short',
                day: 'numeric'
            });
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
                                <p className="text-gray-600">Loading dashboard...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 animate-slide-in">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Welcome to the admin dashboard</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-500">Total Users</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_users || 0}</h3>
                            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View all →
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-sky-100 rounded-xl">
                                    <Users className="h-6 w-6 text-sky-600" />
                                </div>
                                <span className="text-sm text-gray-500">Recruiters</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_recruiters || 0}</h3>
                            <Link to="/admin/users?role=recruiter" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                View recruiters →
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <span className="text-sm text-gray-500">Admins</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_admins || 0}</h3>
                            <Link to="/admin/users?role=admin" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                View admins →
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-pink-100 rounded-xl">
                                    <Layout className="h-6 w-6 text-pink-600" />
                                </div>
                                <span className="text-sm text-gray-500">Templates</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_templates || 0}</h3>
                            <Link to="/admin/templates" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                                Manage →
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-500">Resumes</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_resumes || 0}</h3>
                            <p className="text-sm text-gray-600">Total created</p>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Activity className="h-5 w-5 text-purple-600 mr-2" />
                                <h2 className="text-xl font-bold text-gray-900">User Activity</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active (24h)</span>
                                    <span className="text-2xl font-bold text-gray-900">{stats?.active_users_24h || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active (7d)</span>
                                    <span className="text-2xl font-bold text-gray-900">{stats?.active_users_7d || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center mb-4">
                                <TrendingUp className="h-5 w-5 text-pink-600 mr-2" />
                                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                            </div>
                            <div className="space-y-3">
                                <Link
                                    to="/admin/users"
                                    className="block px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium"
                                >
                                    Manage Users
                                </Link>
                                <Link
                                    to="/admin/templates"
                                    className="block px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                                >
                                    Manage Templates
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Users */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                                <Link to="/admin/users" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                                    View all →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {stats?.recent_users?.length > 0 ? (
                                    stats.recent_users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full border-2 border-purple-200"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent users</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Templates */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Recent Templates</h2>
                                <Link to="/admin/templates" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                                    View all →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {stats?.recent_templates?.length > 0 ? (
                                    stats.recent_templates.map((template) => (
                                        <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-gray-900">{template.name}</p>
                                                <p className="text-sm text-gray-500">{template.category}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{formatDate(template.created_at)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent templates</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

