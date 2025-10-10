'use client'

/**
 * Create Schedule Page
 * 
 * Page for creating new schedules with time slots, devices, and content.
 * Following UI copilot instructions:
 * - Client Component for interactivity
 * - TypeScript strict typing
 * - Tailwind CSS styling
 * - Feature-based organization
 */

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScheduleBuilder } from '@/features/schedules/components/ScheduleBuilder'
import type { CreateScheduleRequest } from '@/features/schedules/types'
import { useCreateSchedule } from '@/features/schedules/hooks/useSchedules'

export default function CreateSchedulePage() {
  const router = useRouter()
  const createScheduleMutation = useCreateSchedule()

  const handleSave = async (scheduleData: CreateScheduleRequest) => {
    try {
      console.log('💾 Creating schedule:', scheduleData)
      
      await createScheduleMutation.mutateAsync(scheduleData)
      
      console.log('✅ Schedule created successfully')
      
      // Navigate back to schedules list
      router.push('/schedules')
    } catch (error) {
      console.error('❌ Failed to create schedule:', error)
      // Error handling is managed by the mutation
      alert('Failed to create schedule. Please check the form and try again.')
    }
  }

  const handleCancel = () => {
    router.push('/schedules')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Schedules</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">
              Define when and where your content will be displayed
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Builder */}
      <ScheduleBuilder
        onSave={handleSave}
        onCancel={handleCancel}
        className="max-w-7xl"
      />
    </div>
  )
}
