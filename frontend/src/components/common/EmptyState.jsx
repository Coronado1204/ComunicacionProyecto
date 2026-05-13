import { FileText, MapPin, Users, AlertCircle } from 'lucide-react'

const ICONS = {
  reports: FileText,
  map: MapPin,
  users: Users,
  error: AlertCircle,
}

export const EmptyState = ({ type = 'reports', title, description, action }) => {
  const Icon = ICONS[type] || FileText
  return (
    <div
      className="card flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-label={title}
    >
      <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4"
        aria-hidden="true">
        <Icon size={22} className="text-neutral-400" />
      </div>
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      {description && (
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-4">
          {action.label}
        </button>
      )}
    </div>
  )
}