type MetricCardProps = {
  title: string
  value: string | number
}

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}