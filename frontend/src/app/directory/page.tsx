import { useEffect, useState } from "react"
import UserCard from "@/components/directory/UserCard"

export default function DirectoryPage() {
   console.log("Directory page loaded")

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")

 useEffect(() => {
  fetch("http://localhost:5000/directory", {
    credentials: "include"
  })
    .then(res => {
      console.log("Response status:", res.status)
      return res.json()
    })
    .then(data => {
      console.log("Directory API data:", data)
      setUsers(data.users || [])
    })
    .catch(err => {
      console.error("Directory fetch error:", err)
    })
}, [])

  const filtered = users.filter((u) => {
    const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse alumni and students in the network
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full md:w-96 border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user) => (
          <UserCard key={user.profileId} user={user} />
        ))}
      </div>

    </div>
  )
}