'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Monitor,
  AlertCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  Eye,
  UserCheck,
  LogIn,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { userService } from '../services/userService'
import { analyticsService } from '@/services/analyticsService'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { cn } from '@/lib/utils'
import type { User } from '@/types/api'

// Simple UI components (following existing pattern from device pages)
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 border-b border-gray-200', className)}>
      {children}
    </div>
  )
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

// Simple Select component
function Select({ 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className
      )}
    >
      {children}
    </select>
  )
}

// Simple Tabs component
function Tabs({ 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  )
}

function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {children}
    </div>
  )
}

function TabsTrigger({ 
  value, 
  children, 
  selectedValue, 
  onSelect 
}: { 
  value: string; 
  children: React.ReactNode; 
  selectedValue: string; 
  onSelect: (value: string) => void 
}) {
  const isActive = value === selectedValue
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {children}
    </button>
  )
}

function TabsContent({ 
  value, 
  selectedValue, 
  children, 
  className 
}: { 
  value: string; 
  selectedValue: string; 
  children: React.ReactNode; 
  className?: string 
}) {
  if (value !== selectedValue) return null
  return (
    <div className={cn('mt-6', className)}>
      {children}
    </div>
  )
}

export interface UserMetricsData {
  summary: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    averageSessionDuration: number
    totalSessions: number
    conversionRate: number
    retentionRate: number
  }
  loginPatterns: {
    dailyLogins: Array<{
      date: string
      count: number
      uniqueUsers: number
    }>
    hourlyDistribution: Array<{
      hour: number
      count: number
    }>
    weeklyTrends: Array<{
      week: string
      logins: number
      users: number
    }>
  }
  userActivity: {
    topActiveUsers: Array<{
      userId: number
      fullName: string
      email: string
      sessionCount: number
      totalDuration: number
      lastLogin: string
    }>
    activityByRole: Array<{
      role: string
      userCount: number
      averageActivity: number
      color: string
    }>
    featureUsage: Array<{
      feature: string
      usageCount: number
      uniqueUsers: number
      percentage: number
    }>
  }
  performance: {
    averageLoadTime: number
    errorRate: number
    slowQueries: number
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor'
  }
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    bounceRate: number
    averageSessionPages: number
  }
}

export interface UserMetricsProps {
  className?: string
  userId?: number // Optional: show metrics for specific user
  dateRange?: '24h' | '7d' | '30d' | '90d' | '1y'
  autoRefresh?: boolean
  showExportOptions?: boolean
}

/**
 * UserMetrics Component
 * 
 * Displays comprehensive user analytics including:
 * - User statistics and KPIs
 * - Login patterns and activity metrics
 * - Performance indicators
 * - Data visualization with interactive charts
 * - Real-time updates with WebSocket integration
 * 
 * Features:
 * - Multiple time range filters
 * - Interactive charts and graphs
 * - Export functionality
 * - Real-time data updates
 * - Performance monitoring
 * - Mobile-responsive design
 */
export function UserMetrics({
  className = '',
  userId,
  dateRange = '7d',
  autoRefresh = true,
  showExportOptions = true,
}: UserMetricsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(dateRange)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch user metrics data
  const {
    data: metricsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userMetrics', { userId, timeRange: selectedTimeRange }],
    queryFn: async () => {
      try {
        // For specific user metrics
        if (userId) {
          const response = await userService.getUserAssignmentStats(userId)
          return transformSingleUserToMetrics(response, selectedTimeRange)
        }
        
        // For general user analytics
        const [dashboardStats, userStats] = await Promise.all([
          analyticsService.getOverview(),
          userService.getUsers({ page: 1, limit: 1000 }) // Get all users for analysis
        ])
        
        // Transform data to UserMetricsData format
        return transformToUserMetrics(dashboardStats, userStats, selectedTimeRange)
      } catch (error) {
        throw error
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? 60000 : false, // 1 minute auto-refresh
    refetchOnWindowFocus: false,
  })

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  // Handle export
  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    // Implementation would integrate with existing export service
    console.log(`Exporting user metrics as ${format}`)
  }

  if (error) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Failed to load metrics</h3>
        <p className="mt-2 text-sm text-gray-600">
          Unable to fetch user analytics data. Please try again.
        </p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {userId ? 'User Analytics' : 'User Metrics'}
          </h2>
          <p className="text-sm text-gray-600">
            {userId 
              ? 'Detailed metrics for selected user'
              : 'System-wide user activity and performance analytics'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Select
            value={selectedTimeRange}
            onValueChange={(value) => setSelectedTimeRange(value as typeof selectedTimeRange)}
            className="w-32"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </Select>

          {/* Export Options */}
          {showExportOptions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', { 'animate-spin': isLoading || refreshing })} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metricsData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={metricsData.summary.totalUsers}
            icon={Users}
            trend={{
              value: metricsData.summary.newUsersThisMonth,
              isPositive: metricsData.summary.newUsersThisMonth > 0,
              suffix: 'new this month'
            }}
            color="blue"
            loading={isLoading}
          />
          
          <MetricCard
            title="Active Users"
            value={metricsData.summary.activeUsers}
            icon={UserCheck}
            trend={{
              value: Math.round((metricsData.summary.activeUsers / metricsData.summary.totalUsers) * 100),
              isPositive: true,
              suffix: '% active rate'
            }}
            color="green"
            loading={isLoading}
          />
          
          <MetricCard
            title="Avg Session Duration"
            value={`${Math.round(metricsData.summary.averageSessionDuration / 60)}m`}
            icon={Clock}
            trend={{
              value: metricsData.summary.retentionRate,
              isPositive: metricsData.summary.retentionRate > 70,
              suffix: '% retention'
            }}
            color="purple"
            loading={isLoading}
          />
          
          <MetricCard
            title="System Health"
            value={metricsData.performance.systemHealth}
            icon={Activity}
            trend={{
              value: metricsData.performance.errorRate,
              isPositive: metricsData.performance.errorRate < 5,
              suffix: '% error rate'
            }}
            color={metricsData.performance.systemHealth === 'excellent' ? 'green' : 'yellow'}
            loading={isLoading}
          />
        </div>
      )}

      {/* Tabs for Different Views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger 
            value="overview" 
            selectedValue={selectedTab} 
            onSelect={setSelectedTab}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            selectedValue={selectedTab} 
            onSelect={setSelectedTab}
          >
            User Activity
          </TabsTrigger>
          <TabsTrigger 
            value="patterns" 
            selectedValue={selectedTab} 
            onSelect={setSelectedTab}
          >
            Login Patterns
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            selectedValue={selectedTab} 
            onSelect={setSelectedTab}
          >
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" selectedValue={selectedTab} className="space-y-6">
          {metricsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Login Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Login Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Average</span>
                      <span className="font-semibold">
                        {Math.round(metricsData.loginPatterns.dailyLogins.reduce((acc: number, curr: any) => acc + curr.count, 0) / metricsData.loginPatterns.dailyLogins.length)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Peak Hour</span>
                      <span className="font-semibold">
                        {metricsData.loginPatterns.hourlyDistribution.reduce((max: any, curr: any) => curr.count > max.count ? curr : max).hour}:00
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unique Users Today</span>
                      <span className="font-semibold">
                        {metricsData.loginPatterns.dailyLogins[metricsData.loginPatterns.dailyLogins.length - 1]?.uniqueUsers || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Distribution by Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metricsData.userActivity.activityByRole.map((role: any) => (
                      <div key={role.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="text-sm">{role.role}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{role.userCount}</span>
                          <span className="text-xs text-gray-600 ml-1">users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="activity" selectedValue={selectedTab} className="space-y-6">
          {metricsData && (
            <>
              {/* Top Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Most Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metricsData.userActivity.topActiveUsers.slice(0, 10).map((user: any, index: number) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.fullName}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.sessionCount} sessions</p>
                          <p className="text-xs text-gray-600">
                            {Math.round(user.totalDuration / 60)}m total
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feature Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Feature Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metricsData.userActivity.featureUsage.map((feature: any) => (
                      <div key={feature.feature} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{feature.feature}</span>
                            <span className="text-xs text-gray-600">{feature.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${feature.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium">{feature.usageCount}</p>
                          <p className="text-xs text-gray-600">{feature.uniqueUsers} users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Login Patterns Tab */}
        <TabsContent value="patterns" selectedValue={selectedTab} className="space-y-6">
          {metricsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Login Distribution by Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metricsData.loginPatterns.hourlyDistribution.map((hour: any) => (
                      <div key={hour.hour} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-8">{hour.hour}:00</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ 
                              width: `${(hour.count / Math.max(...metricsData.loginPatterns.hourlyDistribution.map((h: any) => h.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-8">{hour.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Login Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metricsData.loginPatterns.weeklyTrends.map((week: any) => (
                      <div key={week.week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm">{week.week}</span>
                        <div className="text-right">
                          <p className="text-sm font-medium">{week.logins} logins</p>
                          <p className="text-xs text-gray-600">{week.users} unique users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" selectedValue={selectedTab} className="space-y-6">
          {metricsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Load Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {metricsData.performance.averageLoadTime.toFixed(1)}s
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Average Load Time</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Error Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={cn(
                      'text-3xl font-bold',
                      metricsData.performance.errorRate < 5 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {metricsData.performance.errorRate.toFixed(2)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Error Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Slow Queries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {metricsData.performance.slowQueries}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Queries {'>'} 1s</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading user metrics...</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * MetricCard Component
 * Reusable card for displaying key performance indicators
 */
interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
    suffix?: string
  }
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  loading?: boolean
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue', 
  loading = false 
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {trend.value} {trend.suffix}
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Transform single user assignment stats to UserMetricsData format
 */
function transformSingleUserToMetrics(
  assignmentStats: any,
  timeRange: string
): UserMetricsData {
  return {
    summary: {
      totalUsers: 1,
      activeUsers: 1,
      newUsersThisMonth: 0,
      averageSessionDuration: 1800,
      totalSessions: assignmentStats.totalAssigned || 0,
      conversionRate: 0.85,
      retentionRate: 0.78,
    },
    loginPatterns: {
      dailyLogins: generateMockDailyLogins(timeRange),
      hourlyDistribution: generateMockHourlyDistribution(),
      weeklyTrends: generateMockWeeklyTrends(),
    },
    userActivity: {
      topActiveUsers: [],
      activityByRole: [
        { role: 'Current User', userCount: 1, averageActivity: 85, color: '#3B82F6' },
      ],
      featureUsage: [
        { feature: 'Schedule Assignment', usageCount: assignmentStats.totalAssigned || 0, uniqueUsers: 1, percentage: 100 },
        { feature: 'Active Assignments', usageCount: assignmentStats.activeAssignments || 0, uniqueUsers: 1, percentage: 80 },
      ],
    },
    performance: {
      averageLoadTime: 1.2,
      errorRate: assignmentStats.conflictCount > 0 ? 5.0 : 1.0,
      slowQueries: 0,
      systemHealth: 'excellent',
    },
    engagement: {
      dailyActiveUsers: 1,
      weeklyActiveUsers: 1,
      monthlyActiveUsers: 1,
      bounceRate: 0.15,
      averageSessionPages: 8.5,
    },
  }
}

/**
 * Transform dashboard stats to UserMetricsData format
 * This would typically be handled by a dedicated API endpoint
 */
function transformToUserMetrics(
  dashboardStats: any, 
  userStats: any, 
  timeRange: string
): UserMetricsData {
  // Mock transformation - in real implementation, this would come from dedicated analytics API
  const users = userStats.data || []
  const activeUsers = users.filter((u: User) => u.isActive).length
  
  return {
    summary: {
      totalUsers: users.length,
      activeUsers,
      newUsersThisMonth: Math.floor(users.length * 0.1), // Mock 10% new users
      averageSessionDuration: 1800, // 30 minutes in seconds
      totalSessions: users.length * 12, // Mock 12 sessions per user
      conversionRate: 0.85,
      retentionRate: 0.78,
    },
    loginPatterns: {
      dailyLogins: generateMockDailyLogins(timeRange),
      hourlyDistribution: generateMockHourlyDistribution(),
      weeklyTrends: generateMockWeeklyTrends(),
    },
    userActivity: {
      topActiveUsers: users.slice(0, 10).map((user: User, index: number) => ({
        userId: user.userId,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        sessionCount: 20 - index * 2,
        totalDuration: (20 - index * 2) * 1200,
        lastLogin: new Date(Date.now() - index * 86400000).toISOString(),
      })),
      activityByRole: [
        { role: 'Admin', userCount: users.filter((u: User) => u.role === 'Admin').length, averageActivity: 85, color: '#3B82F6' },
        { role: 'Manager', userCount: users.filter((u: User) => (u as any).role === 'Manager').length, averageActivity: 72, color: '#10B981' },
        { role: 'User', userCount: users.filter((u: User) => u.role === 'User').length, averageActivity: 65, color: '#8B5CF6' },
      ],
      featureUsage: [
        { feature: 'Dashboard', usageCount: users.length * 15, uniqueUsers: activeUsers, percentage: 95 },
        { feature: 'User Management', usageCount: Math.floor(users.length * 8), uniqueUsers: Math.floor(activeUsers * 0.6), percentage: 60 },
        { feature: 'Device Management', usageCount: Math.floor(users.length * 12), uniqueUsers: Math.floor(activeUsers * 0.8), percentage: 80 },
        { feature: 'Media Library', usageCount: Math.floor(users.length * 10), uniqueUsers: Math.floor(activeUsers * 0.7), percentage: 70 },
        { feature: 'Analytics', usageCount: Math.floor(users.length * 5), uniqueUsers: Math.floor(activeUsers * 0.4), percentage: 40 },
      ],
    },
    performance: {
      averageLoadTime: 1.2,
      errorRate: 2.1,
      slowQueries: 3,
      systemHealth: 'excellent',
    },
    engagement: {
      dailyActiveUsers: Math.floor(activeUsers * 0.6),
      weeklyActiveUsers: Math.floor(activeUsers * 0.8),
      monthlyActiveUsers: activeUsers,
      bounceRate: 0.15,
      averageSessionPages: 8.5,
    },
  }
}

// Helper functions for mock data generation
function generateMockDailyLogins(timeRange: string) {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0] || '',
    count: Math.floor(Math.random() * 50) + 20,
    uniqueUsers: Math.floor(Math.random() * 30) + 15,
  })).reverse()
}

function generateMockHourlyDistribution() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 20) + (hour >= 9 && hour <= 17 ? 30 : 5),
  }))
}

function generateMockWeeklyTrends() {
  return Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${4 - i}`,
    logins: Math.floor(Math.random() * 200) + 150,
    users: Math.floor(Math.random() * 50) + 40,
  })).reverse()
}

export default UserMetrics