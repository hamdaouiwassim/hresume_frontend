import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../Layouts/AdminLayout';
import { getAdminResumes, getAdminResume } from '../../services/adminService';
import { toast } from 'sonner';
import { 
    Loader2, 
    ArrowLeft, 
    FileText, 
    User, 
    Calendar,
    Eye,
    X,
    Search,
    Edit
} from 'lucide-react';

export default function UserCVs() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResume, setSelectedResume] = useState(null);
    const [isViewingResume, setIsViewingResume] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    useEffect(() => {
        fetchUserCVs();
    }, [id, searchQuery]);

    const fetchUserCVs = async (page = 1) => {
        try {
            setIsLoading(true);
            const params = {
                per_page: 15,
                page: page,
                user_id: id,
                ...(searchQuery && { search: searchQuery })
            };
            const response = await getAdminResumes(params);
            if (response.data.status) {
                const data = response.data.data;
                const resumesList = data.data || data || [];
                setResumes(resumesList);
                
                // Extract user info from first resume if available
                if (resumesList.length > 0 && resumesList[0].user) {
                    setUserInfo(resumesList[0].user);
                }
                
                if (data.current_page !== undefined) {
                    setPagination({
                        current_page: data.current_page || 1,
                        last_page: data.last_page || 1,
                        per_page: data.per_page || 15,
                        total: data.total || resumesList.length
                    });
                } else {
                    setPagination({
                        current_page: 1,
                        last_page: 1,
                        per_page: resumesList.length || 15,
                        total: resumesList.length
                    });
                }
            } else {
                toast.error('Failed to load CVs');
            }
        } catch (error) {
            console.error('Error fetching user CVs:', error);
            toast.error('Failed to load CVs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewResume = async (resumeId) => {
        try {
            const response = await getAdminResume(resumeId);
            if (response.data.status) {
                setSelectedResume(response.data.data);
                setIsViewingResume(true);
            } else {
                toast.error('Failed to load resume details');
            }
        } catch (error) {
            console.error('Error fetching resume:', error);
            toast.error('Failed to load resume details');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
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

    if (isViewingResume && selectedResume) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <button
                                onClick={() => {
                                    setIsViewingResume(false);
                                    setSelectedResume(null);
                                }}
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Back to List
                            </button>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Details</h1>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedResume.name}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {selectedResume.user && (
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            {selectedResume.user.name} ({selectedResume.user.email})
                                        </div>
                                    )}
                                    {selectedResume.template && (
                                        <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Template: {selectedResume.template.name}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {formatDate(selectedResume.updated_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Resume Content Preview */}
                            <div className="space-y-6">
                                {selectedResume.basicInfo && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Information</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {JSON.stringify(selectedResume.basicInfo, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {selectedResume.experiences && selectedResume.experiences.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Experiences ({selectedResume.experiences.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedResume.experiences.map((exp, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-semibold text-gray-900">{exp.title || 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">{exp.company || 'N/A'}</p>
                                                    {exp.start_date && (
                                                        <p className="text-xs text-gray-500">
                                                            {exp.start_date} - {exp.end_date || 'Present'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedResume.educations && selectedResume.educations.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Education ({selectedResume.educations.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedResume.educations.map((edu, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-semibold text-gray-900">{edu.degree || 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">{edu.institution || 'N/A'}</p>
                                                    {edu.start_date && (
                                                        <p className="text-xs text-gray-500">
                                                            {edu.start_date} - {edu.end_date || 'Present'}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedResume.skills && selectedResume.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Skills ({selectedResume.skills.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResume.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                                >
                                                    {skill.name || skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedResume.languages && selectedResume.languages.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Languages ({selectedResume.languages.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedResume.languages.map((lang, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-semibold text-gray-900">
                                                        {lang.language || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Proficiency: {lang.proficiency || 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <Link
                                        to={`/resume/edit/${selectedResume.id}`}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Resume
                                    </Link>
                                    <button
                                        onClick={() => navigate(`/admin/users/${selectedResume.user_id}`)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        View User
                                    </button>
                                </div>
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
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(`/admin/users/${id}`)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to User Details
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">User's Generated CVs</h1>
                                {userInfo && (
                                    <p className="text-gray-600">
                                        All resumes created by{' '}
                                        <span className="font-semibold">{userInfo.name}</span> ({userInfo.email})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by resume name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Resumes List */}
                    {isLoading ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
                            <div className="flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                <span className="ml-3 text-gray-600">Loading CVs...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Resume Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Template
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {resumes.length > 0 ? (
                                            resumes.map((resume) => (
                                                <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <FileText className="h-5 w-5 text-purple-600 mr-3" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">
                                                                    {resume.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">ID: #{resume.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {resume.template ? (
                                                            <span className="text-sm text-gray-900">
                                                                {resume.template.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                            {formatDate(resume.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                            {formatDate(resume.updated_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleViewResume(resume.id)}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <Link
                                                                to={`/resume/edit/${resume.id}`}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit Resume"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500">
                                                        {searchQuery
                                                            ? 'No resumes found matching your search'
                                                            : 'This user has not created any resumes yet'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing{' '}
                                        {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                        {Math.min(
                                            pagination.current_page * pagination.per_page,
                                            pagination.total
                                        )}{' '}
                                        of {pagination.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchUserCVs(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => fetchUserCVs(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

