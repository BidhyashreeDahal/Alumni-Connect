import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import UserCard from "@/components/directory/UserCard"

export default function DirectoryPage() {

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [programFilter, setProgramFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")

  useEffect(() => {
    fetch("http://localhost:5000/directory", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error("Directory fetch error:", err))
  }, [])

  const filtered = users.filter((u) => {

   const query = search.toLowerCase()
   const matchesSearch =
  `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(query) ||
   (u.jobTitle ?? "").toLowerCase().includes(query) ||
   (u.company ?? "").toLowerCase().includes(query) ||
   (u.program ?? "").toLowerCase().includes(query) ||
   (u.profileType ?? "").toLowerCase().includes(query) ||
   (u.skills ?? []).some((skill: string) =>
    skill.toLowerCase().includes(query)
    )

    const matchesProgram =
      !programFilter || u.program === programFilter

    const matchesYear =
      !yearFilter || String(u.graduationYear) === yearFilter

    return matchesSearch && matchesProgram && matchesYear
  })

  const currentYear = new Date().getFullYear()

  const years = Array.from(
    { length: currentYear - 1960 + 1 },
    (_, i) => currentYear - i
  )

  return (
    <div className="p-8 space-y-8">

      {/* Page Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Alumni Directory
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Discover alumni and students across the network
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {filtered.length} members
        </div>

      </div>


      {/* Filters Panel */}
      <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-center">

        {/* Search */}
        <div className="relative w-64">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni..."
            className="pl-9 pr-3 py-2 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* Program Filter */}
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Programs</option>
          <option value="CPA">Computer Programming</option>
        </select>


        {/* Year Filter */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Graduation Years</option>

          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}

        </select>

      </div>


      {/* Directory Grid */}
      {filtered.length === 0 ? (

        <div className="bg-white border rounded-lg p-10 text-center text-gray-500 text-sm">
          No alumni found matching your filters.
        </div>

      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filtered.map((user) => (
            <UserCard
              key={user.profileId}
              user={user}
            />
          ))}

        </div>
      )}
    </div>
  )
}
