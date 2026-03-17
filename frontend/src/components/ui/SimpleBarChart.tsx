import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type Props = {
  title: string
  data: any[]
  labelKey: string
  valueKey: string
}

export default function BarChartCard({
  title,
  data,
  labelKey,
  valueKey
}: Props) {

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">

      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        {title}
      </h2>

      <div className="h-64">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data} barCategoryGap="35%">

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey={labelKey}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
            />

            <Tooltip />

            <Bar
              dataKey={valueKey}
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={46}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  )
}