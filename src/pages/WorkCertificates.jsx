import { Link } from "react-router-dom";
import AuthLayout from "../Layouts/AuthLayout";
import { Plus, ScrollText, Download, Edit2, Trash2, Loader2, Calendar } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import {
  getWorkCertificates,
  deleteWorkCertificate,
  downloadWorkCertificatePdf,
} from "../services/workCertificateService";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

export default function WorkCertificates() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });

  const strings = t.workCertificate || {};

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const response = await getWorkCertificates();
      if (response.data.status) {
        setItems(response.data.data);
      } else {
        toast.error(strings.messages?.loadError || "Failed to load");
      }
    } catch {
      toast.error(strings.messages?.loadError || "Failed to load");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item) => setDeleteDialog({ isOpen: true, item });

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await deleteWorkCertificate(deleteDialog.item.id);
      toast.success(strings.messages?.deleteSuccess || "Deleted");
      setItems((prev) => prev.filter((x) => x.id !== deleteDialog.item.id));
      setDeleteDialog({ isOpen: false, item: null });
    } catch (error) {
      toast.error(error.response?.data?.message || strings.messages?.deleteError || "Failed");
    }
  };

  const handleDownload = async (item) => {
    try {
      const response = await downloadWorkCertificatePdf(item.id, language);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const safe = (item.title || "work-certificate").replace(/\s+/g, "_");
      link.setAttribute("download", `${safe}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error(strings.messages?.pdfError || "Failed to download PDF");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const locale = language === "fr" ? "fr-FR" : "en-US";
      return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[480px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-sm">
                <ScrollText className="h-5 w-5" />
                {strings.title}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-700 bg-clip-text text-transparent">
                {strings.title}
              </h1>
              <p className="text-gray-600 mt-2 max-w-xl">{strings.subtitle}</p>
              <p className="text-sm text-gray-500 mt-1">
                {items.length}{" "}
                {items.length === 1 ? strings.countOne : strings.countOther}
              </p>
            </div>
            <Link
              to="/work-certificate/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5" />
              {strings.createNew}
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white/80 rounded-2xl border border-slate-200 shadow-sm">
              <ScrollText className="h-14 w-14 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">{strings.noItems}</h2>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">{strings.noItemsDesc}</p>
              <Link
                to="/work-certificate/create"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                {strings.createFirst}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.company_name}</p>
                      <p className="text-sm text-slate-500">{item.employee_name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                        title="PDF"
                        aria-label="Download PDF"
                      >
                        <Download className="h-5 w-5 shrink-0" />
                      </button>
                      <Link
                        to={`/work-certificate/edit/${item.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                        aria-label={t.common?.edit || "Edit"}
                        title={t.common?.edit || "Edit"}
                      >
                        <Edit2 className="h-5 w-5 shrink-0" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                        aria-label={t.common?.delete || "Delete"}
                        title={t.common?.delete || "Delete"}
                      >
                        <Trash2 className="h-5 w-5 shrink-0" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    {strings.lastModified}: {formatDate(item.updated_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title={t.common?.confirmDelete || "Delete certificate"}
        message={strings.messages?.deleteConfirmMessage || "Are you sure you want to delete this certificate?"}
        itemName={deleteDialog.item?.title}
        confirmText={t.common?.confirmDelete || "Delete"}
        cancelText={t.common?.cancel || "Cancel"}
      />
    </AuthLayout>
  );
}
