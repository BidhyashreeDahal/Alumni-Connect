type ActionButtonProps = {
  label: string
  onClick: () => void
}

export default function ActionButton({
  label,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
      type="button"
    >
      {label}
    </button>
  )
}