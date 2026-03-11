import DashboardLayout from "@/components/layout/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Students
          </p>
          <p className="text-2xl font-semibold mt-2">
            0
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Alumni
          </p>
          <p className="text-2xl font-semibold mt-2">
            0
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Mentorship Requests
          </p>
          <p className="text-2xl font-semibold mt-2">
            0
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Events
          </p>
          <p className="text-2xl font-semibold mt-2">
            0
          </p>
        </div>

      </div>

    </DashboardLayout>
  )
}