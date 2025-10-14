'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3,
  Monitor,
  FileText,
  Calendar,
  Settings,
  Music
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Displays', href: '/displays', icon: Monitor },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Playlists', href: '/playlists', icon: Music },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-white font-semibold">SignageHub</h1>
            <p className="text-gray-400 text-sm">Backoffice</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Navigation
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon 
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                    `}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}