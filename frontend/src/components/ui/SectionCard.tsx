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
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>

        {action && actionLabel && (
          <button
            onClick={action}
            className="text-sm text-blue-600 hover:underline"
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