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
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      type="button"
    >
      {label}
    </button>
  )
}