import { Monitor } from 'lucide-react';
import { DisplayDevice, DisplayStatus } from '@/types';

interface RecentDisplaysProps {
  devices?: DisplayDevice[];
}

/**
 * Status badge component - Server Component
 */
function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${status === 'online' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
      }
    `}>
      <span className={`
        w-1.5 h-1.5 rounded-full mr-1
        ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'}
      `} />
      {status}
    </span>
  );
}

/**
 * Display card component - Server Component
 */
function DisplayCard({ device }: { device: DisplayDevice }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Monitor className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{device.name}</h4>
          <p className="text-sm text-gray-600">{device.location}</p>
        </div>
      </div>
      <StatusBadge status={device.status} />
    </div>
  );
}

/**
 * Recent displays component - Server Component
 * Shows list of recent display devices with status
 */
export default function RecentDisplays({ devices }: RecentDisplaysProps) {
  const defaultDevices: DisplayDevice[] = [
    {
      id: '1',
      name: 'Lobby Display 1',
      location: 'Main Building',
      status: 'online'
    },
    {
      id: '2', 
      name: 'Cafeteria Screen',
      location: 'Floor 2',
      status: 'online'
    },
    {
      id: '3',
      name: 'Conference Room A',
      location: 'Floor 3', 
      status: 'offline'
    }
  ];

  const displayDevices = devices || defaultDevices;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Displays</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor your active displays</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            View All
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {displayDevices.map((device) => (
            <DisplayCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
}