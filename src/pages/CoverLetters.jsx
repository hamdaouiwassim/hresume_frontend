import { Link } from 'react-router-dom';
import AuthLayout from "../Layouts/AuthLayout";
import { Plus, FileText, Download, Edit2, Trash2, Loader2, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import { getCoverLetters, deleteCoverLetter, downloadCoverLetterPDF } from '../services/CoverLetterService';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CoverLetters() {
    const { t, language } = useLanguage();
    const [letters, setLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, letter: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const strings = t?.coverLetter || {};

    useEffect(() => {
        loadCoverLetters();
    }, []);

    const loadCoverLetters = async () => {
        try {
            setIsLoading(true);
            const response = await getCoverLetters();
            if (response.data.status) {
                setLetters(response.data.data);
            } else {
                toast.error(strings.messages?.loadError || 'Failed to load cover letters');
            }
        } catch (error) {
            console.error("Error fetching cover letters:", error);
            toast.error(strings.messages?.loadError || 'Failed to load cover letters');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (letter) => {
        setDeleteDialog({ isOpen: true, letter });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.letter) return;

        setIsDeleting(true);
        try {
            await deleteCoverLetter(deleteDialog.letter.id);
            toast.success(strings.messages?.deleteSuccess || 'Deleted successfully');
            setLetters(letters.filter(l => l.id !== deleteDialog.letter.id));
            setDeleteDialog({ isOpen: false, letter: null });
        } catch (error) {
            console.error("Error deleting letter:", error);
            toast.error(error.response?.data?.message || strings.messages?.deleteError || 'Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async (letter) => {
        try {
            const response = await downloadCoverLetterPDF(letter.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${letter.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download error:", error);
            toast.error('Failed to download PDF');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const locale = language === 'fr' ? 'fr-FR' : 'en-US';
            return date.toLocaleDateString(locale, {
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
            <AuthLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center min-h-[600px]">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">{t.common.loading}</p>
                            </div>
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 animate-slide-in">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse-slow" />
                                <span className="text-blue-600 font-semibold">{strings.title}</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {strings.title}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                {letters.length} {letters.length === 1 ? strings.letterCountOne : strings.letterCountOther}
                            </p>
                        </div>
                        <Link
                            to="/cover-letter/create"
                            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            {strings.createNew}
                        </Link>
                    </div>

                    {letters.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-slide-in">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                                <FileText className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {strings.noLetters}
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                                {strings.noLettersDesc}
                            </p>
                            <Link
                                to="/cover-letter/create"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                {strings.createFirst}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {letters.map((letter) => (
                                <div
                                    key={letter.id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 group"
                                >
                                    <div className="relative h-40 bg-slate-50 flex items-center justify-center border-b border-gray-100">
                                        <FileText className="h-20 w-20 text-blue-200 group-hover:text-blue-300 transition-colors" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                            {letter.title}
                                        </h3>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">{strings.lastModified}:</span>
                                                <span className="ml-2">{formatDate(letter.updated_at)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                To: {letter.recipient_name || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to={`/cover-letter/edit/${letter.id}`}
                                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            >
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                {t.common.edit}
                                            </Link>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleDownload(letter)}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-sm"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    {t.common.download}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(letter)}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-200 text-sm"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    {t.common.delete}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, letter: null })}
                onConfirm={confirmDelete}
                title={strings.messages?.deleteConfirmTitle || "Delete Cover Letter"}
                message={strings.messages?.deleteConfirmMessage || "Are you sure you want to delete this cover letter? This action cannot be undone."}
                itemName={deleteDialog.letter?.title}
                confirmText={t.common?.confirmDelete || "Yes, Delete"}
                cancelText={t.common?.cancel || "Cancel"}
            />
        </AuthLayout>
    );
}
