import { useEffect, useState } from "react";
import { Search, Trash2, Eye, Loader2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  getAdminWorkCertificates,
  getAdminWorkCertificate,
  deleteAdminWorkCertificate,
} from "../../services/adminService";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function WorkCertificatesManagement() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAdminWorkCertificates({ search, per_page: 30 });
      if (response.data?.status) {
        setItems(response.data.data?.data || []);
      }
    } catch {
      toast.error("Failed to load work certificates");
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
      const response = await getAdminWorkCertificate(id);
      if (response.data?.status) {
        setSelected(response.data.data);
      }
    } catch {
      toast.error("Failed to load certificate details");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item) return;
    try {
      await deleteAdminWorkCertificate(deleteDialog.item.id);
      toast.success("Work certificate deleted");
      setDeleteDialog({ isOpen: false, item: null });
      if (selected?.id === deleteDialog.item.id) setSelected(null);
      fetchData();
    } catch {
      toast.error("Failed to delete work certificate");
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
              <ScrollText className="h-5 w-5 shrink-0" />
              Work certifications
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Work certificates</h1>
            <p className="text-gray-600 mt-1">View and remove user-generated employment certificates.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative min-w-0">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by title, company, employee, user…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">
                Certificates ({items.length})
              </div>
              <div className="divide-y divide-gray-100 max-h-[540px] overflow-y-auto">
                {items.length ? (
                  items.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {item.user?.name || "Unknown"} • {item.company_name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleView(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4 shrink-0" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteDialog({ isOpen: true, item })}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-gray-500">No work certificates found.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 min-h-[200px]">
              {selected ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selected.user?.name || "Unknown user"}
                    {selected.user?.email ? ` • ${selected.user.email}` : ""}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium text-gray-900">Employee:</span> {selected.employee_name}
                    </p>
                    {selected.employee_job_title ? (
                      <p>
                        <span className="font-medium text-gray-900">Role:</span> {selected.employee_job_title}
                      </p>
                    ) : null}
                    <p>
                      <span className="font-medium text-gray-900">Company:</span> {selected.company_name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Period:</span> {fmtDate(selected.employment_start)}
                      {selected.is_current_employment ? " — present" : selected.employment_end ? ` — ${fmtDate(selected.employment_end)}` : ""}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Locale:</span> {selected.locale || "en"}
                    </p>
                  </div>
                  {selected.company_address ? (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {selected.company_address}
                    </div>
                  ) : null}
                  {selected.duties_summary ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Duties</p>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {selected.duties_summary}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="text-gray-500">Select a certificate to view details.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete work certificate"
        message="This permanently removes the certificate for the user. Continue?"
        itemName={deleteDialog.item?.title}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
}
