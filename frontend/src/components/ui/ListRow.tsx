type ListRowProps = {
  title: string
  meta?: string
}

export default function ListRow({ title, meta }: ListRowProps) {
  const metaTone =
    meta === "accepted"
      ? "bg-emerald-100 text-emerald-700"
      : meta === "pending"
        ? "bg-amber-100 text-amber-700"
        : meta === "declined" || meta === "cancelled"
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-100 text-slate-600"

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 last:mb-0">
      <span className="text-sm font-medium text-slate-800">{title}</span>
      {meta && (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${metaTone}`}>
          {meta}
        </span>
      )}
    </div>
  )
}