import { useEffect, useState } from "react";
import { Search, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "../../Layouts/AdminLayout";
import { getAdminCoverLetters, getAdminCoverLetter, deleteAdminCoverLetter } from "../../services/adminService";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function CoverLettersManagement() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAdminCoverLetters({ search, per_page: 30 });
      if (response.data?.status) {
        setItems(response.data.data?.data || []);
      }
    } catch (error) {
      toast.error("Failed to load cover letters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    await fetchData();
  };

  const handleView = async (id) => {
    try {
      const response = await getAdminCoverLetter(id);
      if (response.data?.status) {
        setSelected(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load cover letter details");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await deleteAdminCoverLetter(deleteDialog.item.id);
      toast.success("Cover letter deleted");
      setDeleteDialog({ isOpen: false, item: null });
      setSelected(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete cover letter");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generated Cover Letters</h1>
          <p className="text-gray-600 mt-1">Manage all generated cover letters.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, recipient, user..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg"
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium">
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
                Cover Letters ({items.length})
              </div>
              <div className="divide-y divide-gray-100 max-h-[540px] overflow-y-auto">
                {items.length ? items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.user?.name || "Unknown"} • {item.recipient_company || "No company"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleView(item.id)} className="p-2 rounded bg-gray-100 text-gray-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteDialog({ isOpen: true, item })} className="p-2 rounded bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="p-6 text-center text-gray-500">No cover letters found.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {selected ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selected.user?.name || "Unknown user"} • {selected.recipient_name || "No recipient"}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Company:</span> {selected.recipient_company || "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selected.recipient_email || "N/A"}</p>
                    <p><span className="font-medium">Style:</span> {selected.style || "classic"}</p>
                  </div>
                  <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100 max-h-[350px] overflow-y-auto whitespace-pre-wrap text-sm text-gray-800">
                    {selected.content || "No content"}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a cover letter to view details.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Cover Letter"
        message="Are you sure you want to delete this cover letter?"
        itemName={deleteDialog.item?.title}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
}

