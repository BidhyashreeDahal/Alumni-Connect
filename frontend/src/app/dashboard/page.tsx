import DashboardLayout from "@/components/layout/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded border">
          Total Students
        </div>

        <div className="bg-white p-6 rounded border">
          Total Alumni
        </div>

        <div className="bg-white p-6 rounded border">
          Mentorship Requests
        </div>

        <div className="bg-white p-6 rounded border">
          Events
        </div>

      </div>

    </DashboardLayout>
  )
}