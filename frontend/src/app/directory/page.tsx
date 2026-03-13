// <<<<<<< HEAD
// import React from "react";
//
// const Directory: React.FC = () => {
//     return (
//         <div>
//             <h1 className="text-2xl font-bold">Directory</h1>
//         </div>
//     );
// };
//
// export default Directory;
// =======
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
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Alumni Directory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Discover alumni and students across the network
          </p>
        </div>

        <div className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 border border-slate-200">
          {filtered.length} members
        </div>

      </div>


      {/* Filters Panel */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

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
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>


        {/* Program Filter */}
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Programs</option>
          <option value="CPA">Computer Programming</option>
        </select>


        {/* Year Filter */}
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


      {/* Directory Grid */}
      {filtered.length === 0 ? (

        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
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

