import type { ReactNode } from "react"

type SectionCardProps = {
  title: string
  children: ReactNode
  action?: () => void
  actionLabel?: string
}

export default function SectionCard({
  title,
  children,
  action,
  actionLabel,
}: SectionCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>

        {action && actionLabel && (
          <button
            onClick={action}
            className="rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 transition hover:bg-blue-50"
            type="button"
          >
            {actionLabel}
          </button>
        )}
      </div>

      {children}
    </div>
  )
}