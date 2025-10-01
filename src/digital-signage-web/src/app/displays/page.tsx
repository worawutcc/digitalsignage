'use client';

import AdminLayout from '@/components/layouts/AdminLayout';
import { Monitor, Plus } from 'lucide-react';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface DisplayDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastSeen: string;
  resolution: string;
}

function StatusBadge({ status }: { status: 'online' | 'offline' }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${status === 'online' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
      }
    `}>
      <span className={`
        w-1.5 h-1.5 rounded-full mr-1
        ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}
      `} />
      {status}
    </span>
  );
}

export default function DisplaysPage() {
  const devices: DisplayDevice[] = [
    {
      id: '1',
      name: 'Lobby Display 1',
      location: 'Main Building',
      status: 'online',
      lastSeen: '2 minutes ago',
      resolution: '1920x1080'
    },
    {
      id: '2', 
      name: 'Cafeteria Screen',
      location: 'Floor 2',
      status: 'online',
      lastSeen: '5 minutes ago',
      resolution: '3840x2160'
    },
    {
      id: '3',
      name: 'Conference Room A',
      location: 'Floor 3', 
      status: 'offline',
      lastSeen: '2 hours ago',
      resolution: '1920x1080'
    },
    {
      id: '4',
      name: 'Reception Desk',
      location: 'Ground Floor',
      status: 'online',
      lastSeen: '1 minute ago',
      resolution: '1920x1080'
    },
    {
      id: '5',
      name: 'Meeting Room B',
      location: 'Floor 4',
      status: 'offline',
      lastSeen: '1 day ago',
      resolution: '2560x1440'
    }
  ];

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Displays</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your digital signage displays</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Display</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Displays</p>
                <p className="text-2xl font-semibold text-gray-900">{devices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-semibold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-semibold text-red-600">
                  {devices.filter(d => d.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Displays Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Displays</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Monitor className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">{device.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.resolution}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.lastSeen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}