import { useEffect, useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import UserCard from "@/components/directory/UserCard"
import { useAuth } from "@/context/AuthContext"
import { API_BASE_URL } from "@/lib/http"
import { getUserErrorMessage } from "@/lib/error"
import { Link } from "react-router-dom"

export default function DirectoryPage() {
  const { user } = useAuth()

  const [users, setUsers] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(1)
  const pageSize = 11

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "alumni" | "student">(
    user?.role === "student" ? "alumni" : "all"
  )

  useEffect(() => {
    if (user?.role === "student") {
      setTypeFilter("alumni")
    }
  }, [user?.role])

  useEffect(() => {
    const query = new URLSearchParams()

    query.set("page", String(page))
    query.set("pageSize", String(pageSize))

    if (typeFilter !== "all") {
      query.set("profileType", typeFilter)
    }

    if (search.trim()) {
      query.set("search", search.trim())
    }

    setLoading(true)
    setError("")

    fetch(`${API_BASE_URL}/directory?${query.toString()}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load directory")
        setUsers(data.users || [])
        setMeta(data.meta)
      })
      .catch((err) => {
        setUsers([])
        setMeta(null)
        setError(getUserErrorMessage(err, "Directory fetch error"))
      })
      .finally(() => setLoading(false))

  }, [typeFilter, page, search])

  const pageContent = useMemo(() => {
    if (user?.role === "admin" || user?.role === "faculty") {
      return {
        title: "Directory",
        subtitle:
          "Search and manage alumni and student profiles across the network"
      }
    }

    if (user?.role === "student") {
      return {
        title: "Alumni Directory",
        subtitle:
          "Discover alumni profiles, career paths, and mentorship opportunities"
      }
    }

    return {
      title: "Directory",
      subtitle: "Discover people across the network"
    }
  }, [user?.role])

  const showTypeFilters =
    user?.role === "admin" || user?.role === "faculty"

  const activeFilterCount = Number(Boolean(search.trim()))

  function resetFilters() {
    setSearch("")
    setPage(1)
  }

  return (
    <div className="space-y-6">

     {/* HEADER */}

    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {pageContent.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {pageContent.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">

        {(user?.role === "admin" || user?.role === "faculty") && (
          <Link
            to="/profiles/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            + Create Profile
          </Link>
        )}

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
          {meta?.total ?? users.length} members
        </div>

      </div>

    </div>

      {/* FILTERS */}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          <SlidersHorizontal size={14} />
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
        </div>

        {showTypeFilters && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            {[
              { label: "All", value: "all" },
              { label: "Alumni", value: "alumni" },
              { label: "Students", value: "student" }
            ].map((option) => {
              const active = typeFilter === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTypeFilter(option.value as any)
                    setPage(1)
                  }}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}

        <div className="relative w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onInput={() => setPage(1)}
            placeholder="Search directory..."
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        )}
        </div>

        <div className="text-xs text-slate-500">
          Search any field in one box (name, email, program, year, job title, company, skill, interests, claimed/unclaimed).
          Example: <span className="font-medium text-slate-600">CPA 2024 React claimed</span>
        </div>

      </div>

      {/* DIRECTORY GRID */}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading directory...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No profiles found matching your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((person) => (
              <UserCard key={person.profileId} user={person} />
            ))}
          </div>

          {/* PAGINATION */}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-slate-600">
                Page {page} of {meta.totalPages}
              </span>

              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>

            </div>
          )}

        </>
      )}
    </div>
  )
}