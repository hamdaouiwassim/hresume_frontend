import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../Layouts/AdminLayout";
import {
  getAdminOutboundEmails,
  getAdminOutboundEmailSummary,
  sendAdminBulkEmails,
  sendAdminNewFeaturesBulk,
} from "../../services/adminService";
import AdminNewFeaturesEmailForm from "../../components/admin/AdminNewFeaturesEmailForm";
import { toast } from "sonner";
import { formatOutboundType, statusBadge } from "../../utils/outboundEmailLabels";
import {
  Loader2,
  Mail,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Inbox,
} from "lucide-react";
import AdminListPagination from "../../components/admin/AdminListPagination";
import { DEFAULT_ADMIN_PER_PAGE } from "../../constants/adminPagination";

export default function AdminEmails() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_ADMIN_PER_PAGE);
  const [bulkLoading, setBulkLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, logRes] = await Promise.all([
        getAdminOutboundEmailSummary(),
        getAdminOutboundEmails({
          page,
          per_page: perPage,
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(search && { search }),
        }),
      ]);
      if (sumRes.data?.status) setSummary(sumRes.data.data);
      if (logRes.data?.status) setLogs(logRes.data.data);
    } catch {
      toast.error("Failed to load outbound emails");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, typeFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBulk = async (type, filter) => {
    const key = `${type}-${filter}`;
    if (!window.confirm(`Queue ${filter.replace("_", " ")} emails? This may send many messages.`)) {
      return;
    }
    try {
      setBulkLoading(key);
      const res = await sendAdminBulkEmails({ type, filter });
      if (res.data?.status) {
        toast.success(res.data.message || "Bulk send queued");
        load();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Bulk send failed");
    } finally {
      setBulkLoading(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return "—";
    }
  };

  const rows = logs?.data ?? [];
  const lastPage = logs?.last_page ?? 1;
  const total = logs?.total ?? rows.length;
  const currentPage = logs?.current_page ?? page;

  const handlePerPageChange = (size) => {
    setPerPage(size);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="h-8 w-8 text-purple-600" />
              Outbound emails
            </h1>
            <p className="text-gray-600 mt-1">
              Queued, sent, and failed messages with full traceability. Requires a queue worker in production.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Queued" value={summary.queued} icon={Clock} tone="amber" />
            <StatCard label="Sent (30d)" value={summary.sent} icon={CheckCircle} tone="emerald" />
            <StatCard label="Failed (30d)" value={summary.failed} icon={XCircle} tone="red" />
            <StatCard label="Sent (24h)" value={summary.sent_24h} icon={Send} tone="sky" />
            <StatCard label="Stale queued" value={summary.stale_queued} icon={AlertTriangle} tone="orange" sub="Worker may be down" />
            <StatCard label="Jobs pending" value={summary.jobs_pending} icon={Inbox} tone="violet" sub={`${summary.failed_jobs} failed jobs`} />
          </div>
        )}

        <AdminNewFeaturesEmailForm
          className="mb-6"
          showBulk
          onSendBulk={async (data) => {
            const res = await sendAdminNewFeaturesBulk(data);
            if (!res.data?.status) {
              throw new Error(res.data?.message || "Bulk send failed");
            }
            toast.success(res.data.message || "Announcements queued");
            load();
          }}
        />

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Bulk send (templates)</h2>
          <div className="flex flex-wrap gap-2">
            <BulkButton
              loading={bulkLoading === "email_verification_reminder-unverified"}
              onClick={() => handleBulk("email_verification_reminder", "unverified")}
              label="Verification → unverified users"
            />
            <BulkButton
              loading={bulkLoading === "resume_incomplete_reminder-incomplete_resume"}
              onClick={() => handleBulk("resume_incomplete_reminder", "incomplete_resume")}
              label="Resume reminder → incomplete CVs"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              placeholder="Search email, subject, user…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              <option value="admin_custom">Custom message</option>
              <option value="resume_incomplete_reminder">Resume reminder</option>
              <option value="email_verification_reminder">Verification</option>
              <option value="new_features_announcement">New features</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Triggered by</th>
                      <th className="px-4 py-3">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          No emails match your filters.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        const badge = statusBadge(row.status);
                        return (
                          <tr key={row.id} className="hover:bg-gray-50/80">
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                                {badge.label}
                              </span>
                              {row.error_message && (
                                <p className="mt-1 text-xs text-red-600 max-w-[140px] truncate" title={row.error_message}>
                                  {row.error_message}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{formatOutboundType(row.type)}</td>
                            <td className="px-4 py-3">
                              {row.user ? (
                                <Link to={`/admin/users/${row.user_id}`} className="text-purple-600 hover:underline font-medium">
                                  {row.recipient_email}
                                </Link>
                              ) : (
                                row.recipient_email
                              )}
                            </td>
                            <td className="px-4 py-3 max-w-[200px] truncate" title={row.subject}>
                              {row.subject}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{row.triggered_by?.name || "—"}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              <div>Q: {formatDate(row.queued_at)}</div>
                              {row.sent_at && <div>S: {formatDate(row.sent_at)}</div>}
                              {row.failed_at && <div className="text-red-600">F: {formatDate(row.failed_at)}</div>}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {!loading && total > 0 && (
                <AdminListPagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  perPage={perPage}
                  total={total}
                  onPageChange={setPage}
                  onPerPageChange={handlePerPageChange}
                  itemLabel="emails"
                />
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon: Icon, tone, sub }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    sky: "bg-sky-50 text-sky-700",
    orange: "bg-orange-50 text-orange-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg mb-2 ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value ?? 0}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BulkButton({ onClick, loading, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {label}
    </button>
  );
}
