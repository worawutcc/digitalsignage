import { Button } from '@/components/ui/Button'
import { DeviceCardProps } from './DeviceCard.types'

/**
 * Device card component for displaying device information
 */
export function DeviceCard({ 
  device, 
  onEdit, 
  onDelete, 
  onClick 
}: DeviceCardProps) {
  const statusColors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div 
      className="rounded-lg border bg-card p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(device)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{device.name}</h3>
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[device.status]}`}
        >
          {device.status}
        </span>
      </div>
      
      <p className="text-muted-foreground mb-2">{device.location}</p>
      <p className="text-sm text-muted-foreground mb-4">
        Resolution: {device.resolution}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Last seen: {new Date(device.lastSeen).toLocaleString()}
      </p>
      
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(device)
          }}
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(device.id)
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}