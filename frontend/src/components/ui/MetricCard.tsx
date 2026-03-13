type MetricCardProps = {
  title: string
  value: string | number
}

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}