import { useEffect, useState } from "react"
import { invitesAPI } from "@/api/client"
import { Copy, Search, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

type Invite = {
  profileType: "alumni" | "student"
  profileId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  status: "never_invited" | "pending" | "expired" | "claimed"
  lastInviteAt: string | null
  expiresAt: string | null
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  never_invited: {
    label: "Not Invited",
    icon: AlertCircle,
    className: "bg-slate-100 text-slate-700 border-slate-200"
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200"
  },
  claimed: {
    label: "Claimed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
}

export default function InvitesPage() {

  const [invites, setInvites] = useState<Invite[]>([])
  const [meta, setMeta] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "alumni" | "student">("all")

  const [page, setPage] = useState(1)
  const pageSize = 15

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<{ profileId: string; link: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function loadInvites() {

    try {

      setLoading(true)
      setError("")

      const params: any = {
        page,
        pageSize
      }

      if (search) params.search = search
      if (typeFilter !== "all") params.type = typeFilter

      const data = await invitesAPI.list(params)

      setInvites(data.invites || [])
      setMeta(data.meta)

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to load invites")
      console.error("Failed to load invites", err)

    } finally {

      setLoading(false)

    }

  }

  async function sendInvite(profileId: string, profileType: "alumni" | "student") {

    try {

      setActionLoading(profileId)
      setInviteLink(null)

      const data = await invitesAPI.create({ profileId, type: profileType })

      setInviteLink({ profileId, link: data.inviteLink })

      await loadInvites()

    } finally {

      setActionLoading(null)

    }

  }

  async function reissueInvite(profileId: string, profileType: "alumni" | "student") {

    try {

      setActionLoading(profileId)
      setInviteLink(null)

      const data = await invitesAPI.reissue({ profileId, type: profileType })

      setInviteLink({ profileId, link: data.inviteLink })

      await loadInvites()

    } finally {

      setActionLoading(null)

    }

  }

  function copyToClipboard(text: string, profileId: string) {

    navigator.clipboard.writeText(text)

    setCopiedId(profileId)

    setTimeout(() => setCopiedId(null), 2000)

  }

  function getFullName(invite: Invite) {

    const parts = [invite.firstName, invite.lastName].filter(Boolean)

    return parts.length > 0 ? parts.join(" ") : "—"

  }

  useEffect(() => {
    loadInvites()
  }, [search, typeFilter, page])

  return (

    <div className="max-w-7xl mx-auto p-6 md:p-10">

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Invite Management</h1>
        <p className="text-sm text-slate-600">
          Create and manage invitation links for alumni and students to claim their accounts.
        </p>
      </div>

      {/* Filters */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">

        <div className="flex flex-col sm:flex-row gap-4">

          <div className="flex-1 relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
            />

          </div>

          <div className="flex gap-2">

            {["all", "alumni", "student"].map((type) => (

              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type as any)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  typeFilter === type
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {type === "all" ? "All" : type === "alumni" ? "Alumni" : "Students"}
              </button>

            ))}

          </div>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (

          <div className="p-10 text-center text-slate-500">Loading invites...</div>

        ) : invites.length === 0 ? (

          <div className="p-10 text-center text-slate-500">No invites found</div>

        ) : (

          <>
            <table className="w-full text-sm">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Last Invite</th>
                  <th className="px-6 py-3 text-left">Action</th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {invites.map((invite) => {

                  const StatusIcon = statusConfig[invite.status].icon
                  const statusInfo = statusConfig[invite.status]

                  return (

                    <tr key={`${invite.profileType}-${invite.profileId}`}>

                      <td className="px-6 py-4">{invite.profileType}</td>

                      <td className="px-6 py-4 font-medium">
                        {getFullName(invite)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {invite.email || "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded text-xs ${statusInfo.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {invite.lastInviteAt
                          ? new Date(invite.lastInviteAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4">

                        {invite.status === "never_invited" && (
                          <button
                            onClick={() => sendInvite(invite.profileId, invite.profileType)}
                            disabled={actionLoading === invite.profileId}
                            className="text-blue-600 hover:underline"
                          >
                            {actionLoading === invite.profileId ? "Sending..." : "Send Invite"}
                          </button>
                        )}

                        {(invite.status === "expired" || invite.status === "pending") && (
                          <button
                            onClick={() => reissueInvite(invite.profileId, invite.profileType)}
                            disabled={actionLoading === invite.profileId}
                            className="text-amber-600 hover:underline"
                          >
                            {actionLoading === invite.profileId ? "Reissuing..." : "Reissue"}
                          </button>
                        )}

                        {invite.status === "claimed" && (
                          <span className="text-slate-400 text-xs">
                            Claimed
                          </span>
                        )}

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

            {/* Pagination */}

            {meta && meta.totalPages > 1 && (

              <div className="flex items-center justify-between px-6 py-4 border-t">

                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border px-4 py-2 rounded text-sm disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-slate-600">
                  Page {page} of {meta.totalPages}
                </span>

                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border px-4 py-2 rounded text-sm disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            )}

          </>

        )}

      </div>

      {inviteLink && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="font-medium text-blue-700">Invite link generated</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={inviteLink.link}
              className="flex-1 rounded border border-blue-200 bg-white px-2 py-1 text-xs text-slate-700"
            />
            <button
              onClick={() => copyToClipboard(inviteLink.link, inviteLink.profileId)}
              className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              <Copy className="h-3 w-3" />
              {copiedId === inviteLink.profileId ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

    </div>

  )
}