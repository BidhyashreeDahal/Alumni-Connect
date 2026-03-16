import { useEffect, useState } from "react"
import { invitesAPI } from "@/api/client"
import { Copy, Search, Filter, Mail, User, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "alumni" | "student">("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<{ profileId: string; link: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function loadInvites() {
    try {
      setLoading(true)
      setError("")
      const params: any = {}
      if (search) params.search = search
      if (typeFilter !== "all") params.type = typeFilter

      const data = await invitesAPI.list(params)
      setInvites(data.invites || [])
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
      setError("")
      setInviteLink(null)

      const data = await invitesAPI.create({ profileId, type: profileType })
      setInviteLink({ profileId, link: data.inviteLink })
      await loadInvites()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send invite")
    } finally {
      setActionLoading(null)
    }
  }

  async function reissueInvite(profileId: string, profileType: "alumni" | "student") {
    try {
      setActionLoading(profileId)
      setError("")
      setInviteLink(null)

      const data = await invitesAPI.reissue({ profileId, type: profileType })
      setInviteLink({ profileId, link: data.inviteLink })
      await loadInvites()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reissue invite")
    } finally {
      setActionLoading(null)
    }
  }

  function copyToClipboard(text: string, profileId: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(profileId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function getFullName(invite: Invite): string {
    const parts = [invite.firstName, invite.lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "—"
  }

  useEffect(() => {
    loadInvites()
  }, [search, typeFilter])

  const filteredInvites = invites.filter((invite) => {
    if (typeFilter !== "all" && invite.profileType !== typeFilter) return false
    return true
  })

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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("alumni")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                typeFilter === "alumni"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              Alumni
            </button>
            <button
              onClick={() => setTypeFilter("student")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                typeFilter === "student"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              Students
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Invite Link Display */}
      {inviteLink && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900 mb-1">Invite Link Generated</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink.link}
                  className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-md text-sm text-slate-700"
                />
                <button
                  onClick={() => copyToClipboard(inviteLink.link, inviteLink.profileId)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
                >
                  {copiedId === inviteLink.profileId ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setInviteLink(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Loading invites...</p>
          </div>
        ) : filteredInvites.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No invites found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Last Invite</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvites.map((invite) => {
                  const StatusIcon = statusConfig[invite.status].icon
                  const statusInfo = statusConfig[invite.status]

                  return (
                    <tr key={`${invite.profileType}-${invite.profileId}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          <User className="w-3 h-3" />
                          {invite.profileType === "alumni" ? "Alumni" : "Student"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {getFullName(invite)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {invite.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${statusInfo.className}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {invite.lastInviteAt
                          ? new Date(invite.lastInviteAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {invite.status === "never_invited" && (
                            <button
                              onClick={() => sendInvite(invite.profileId, invite.profileType)}
                              disabled={actionLoading === invite.profileId}
                              className="px-3 py-1.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                            >
                              {actionLoading === invite.profileId ? "Sending..." : "Send Invite"}
                            </button>
                          )}
                          {(invite.status === "expired" || invite.status === "pending") && (
                            <button
                              onClick={() => reissueInvite(invite.profileId, invite.profileType)}
                              disabled={actionLoading === invite.profileId}
                              className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                            >
                              {actionLoading === invite.profileId ? "Reissuing..." : "Reissue"}
                            </button>
                          )}
                          {invite.status === "claimed" && (
                            <span className="text-xs text-slate-400">No action needed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
