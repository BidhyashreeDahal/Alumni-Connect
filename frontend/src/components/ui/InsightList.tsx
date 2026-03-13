type Props = {
  title: string
  items: any[]
  labelKey: string
  valueKey: string
}

export default function InsightList({ title, items, labelKey, valueKey }: Props) {

  return (

    <div className="rounded-xl border border-slate-200 bg-white p-6">

      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        {title}
      </h2>

      <div className="space-y-2">

        {items?.map((item, index) => (

          <div
            key={index}
            className="flex justify-between text-sm text-slate-700"
          >

            <span>{item[labelKey]}</span>
            <span className="font-medium">{item[valueKey]}</span>

          </div>

        ))}

      </div>

    </div>

  )

}