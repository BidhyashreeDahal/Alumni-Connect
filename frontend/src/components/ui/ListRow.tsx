type ListRowProps = {
  title: string
  meta?: string
}

export default function ListRow({ title, meta }: ListRowProps) {
  return (
    <div className="flex justify-between py-2 border-b last:border-none">
      <span>{title}</span>
      <span className="text-sm text-gray-500">{meta}</span>
    </div>
  )
}