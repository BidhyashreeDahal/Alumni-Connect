import { useAuth } from "@/context/AuthContext"

export default function EventsPage() {
  const { user } = useAuth()

  const title =
    user?.role === "student" || user?.role === "alumni"
      ? "Event Invitations"
      : "Events"

  const subtitle =
    user?.role === "student" || user?.role === "alumni"
      ? "Review invited events and upcoming participation opportunities."
      : "Create, manage, and review event participation across the platform."

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          The event experience is being expanded next. This screen is already placed in the correct role-based workflow.
        </p>
      </div>
    </div>
  )
}

