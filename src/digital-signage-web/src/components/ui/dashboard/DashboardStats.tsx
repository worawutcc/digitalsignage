import { 
  Monitor,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { StatCardProps } from '@/types';

/**
 * Individual stat card component - Server Component
 */
function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'text-blue-500' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${iconColor} bg-gray-50 p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard statistics component - Server Component
 * Displays key metrics for digital signage system
 */
export default function DashboardStats() {
  const stats = [
    {
      title: 'Active Displays',
      value: '12',
      subtitle: '+2 from last week',
      icon: Monitor,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Content Items',
      value: '48',
      subtitle: '+8 this month',
      icon: FileText,
      iconColor: 'text-cyan-500'
    },
    {
      title: 'Scheduled',
      value: '24',
      subtitle: 'Next 7 days',
      icon: Calendar,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Uptime',
      value: '99.8%',
      subtitle: 'Last 30 days',
      icon: TrendingUp,
      iconColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}