import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import UserCard from "@/components/directory/UserCard"
import { useAuth } from "@/context/AuthContext"

export default function DirectoryPage() {
  const { user } = useAuth()

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [programFilter, setProgramFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
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
    if (typeFilter !== "all") {
      query.set("profileType", typeFilter)
    }

    fetch(`http://localhost:5000/directory${query.toString() ? `?${query.toString()}` : ""}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error("Directory fetch error:", err))
  }, [typeFilter])

  const filtered = users.filter((u) => {
    const query = search.toLowerCase()
    const matchesSearch =
      `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(query) ||
      (u.jobTitle ?? "").toLowerCase().includes(query) ||
      (u.company ?? "").toLowerCase().includes(query) ||
      (u.program ?? "").toLowerCase().includes(query) ||
      (u.profileType ?? "").toLowerCase().includes(query) ||
      (u.skills ?? []).some((skill: string) => skill.toLowerCase().includes(query))

    const matchesProgram = !programFilter || u.program === programFilter
    const matchesYear = !yearFilter || String(u.graduationYear) === yearFilter

    return matchesSearch && matchesProgram && matchesYear
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i)

  const pageContent = useMemo(() => {
    if (user?.role === "admin" || user?.role === "faculty") {
      return {
        title: "Directory",
        subtitle: "Search and manage alumni and student profiles across the network"
      }
    }

    if (user?.role === "student") {
      return {
        title: "Alumni Directory",
        subtitle: "Discover alumni profiles, career paths, and mentorship opportunities"
      }
    }

    return {
      title: "Directory",
      subtitle: "Discover people across the network"
    }
  }, [user?.role])

  const showTypeFilters = user?.role === "admin" || user?.role === "faculty"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {pageContent.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pageContent.subtitle}
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
          {filtered.length} members
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  onClick={() => setTypeFilter(option.value as "all" | "alumni" | "student")}
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
            placeholder="Search directory..."
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Programs</option>
          <option value="CPA">Computer Programming</option>
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Graduation Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No profiles found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person) => (
            <UserCard
              key={person.profileId}
              user={person}
            />
          ))}
        </div>
      )}
    </div>
  )
}
