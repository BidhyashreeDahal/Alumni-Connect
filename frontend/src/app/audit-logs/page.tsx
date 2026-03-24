import { useEffect, useState } from "react"
import { auditLogsAPI } from "@/api/client"
import { useAuth } from "@/context/AuthContext"
import { getUserErrorMessage } from "@/lib/error"

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  summary?: string | null
  requestId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  actorRole?: "admin" | "faculty" | "student" | "alumni" | null
  actor?: {
    id: string
    email: string
    role: "admin" | "faculty" | "student" | "alumni"
  } | null
  metadata?: Record<string, unknown> | null
}

function formatRole(role?: string | null) {
  if (!role) return "system"
  return role
}

function formatUserAgent(value?: string | null) {
  if (!value) return "—"
  return value.length > 80 ? `${value.slice(0, 80)}...` : value
}

export default function AuditLogsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [action, setAction] = useState("")
  const [entityType, setEntityType] = useState("")
  const pageSize = 15

  async function loadLogs() {
    try {
      setLoading(true)
      setError("")
      const data = await auditLogsAPI.list({
        page,
        pageSize,
        search: search || undefined,
        action: action || undefined,
        entityType: entityType || undefined
      })

      setLogs(data.logs || [])
      setTotalPages(data.meta?.totalPages || 1)
    } catch (err: any) {
      setError(getUserErrorMessage(err, "Failed to load audit logs"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [search, action, entityType])

  useEffect(() => {
    loadLogs()
  }, [page, search, action, entityType])

  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-sm text-slate-500">
        This page is only available to administrators.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review administrative activity across invites, users, imports, announcements, and events.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search summary, action, entity, actor..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter by action"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Filter by entity type"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">No audit logs found for the current filters.</div>
        ) : (
          <div className="max-h-[620px] overflow-y-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                <tr className="text-left">
                  <th className="w-[16%] px-4 py-3">When</th>
                  <th className="w-[20%] px-4 py-3">Actor</th>
                  <th className="w-[14%] px-4 py-3">Action</th>
                  <th className="w-[16%] px-4 py-3">Entity</th>
                  <th className="w-[20%] px-4 py-3">Summary</th>
                  <th className="w-[14%] px-4 py-3">Request</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t align-top hover:bg-slate-50/70">
                    <td className="px-4 py-4 text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="truncate font-medium" title={log.actor?.email || "System"}>
                        {log.actor?.email || "System"}
                      </div>
                      <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                        {formatRole(log.actor?.role || log.actorRole)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex max-w-full truncate rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700" title={log.action}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="truncate font-medium" title={log.entityType}>{log.entityType}</div>
                      <div className="truncate text-xs text-slate-500" title={log.entityId || "—"}>
                        {log.entityId || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {log.summary || "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <div className="truncate" title={log.requestId || "—"}>Req: {log.requestId || "—"}</div>
                      <div className="truncate" title={log.ipAddress || "—"}>IP: {log.ipAddress || "—"}</div>
                      <div className="truncate" title={log.userAgent || undefined}>UA: {formatUserAgent(log.userAgent)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
