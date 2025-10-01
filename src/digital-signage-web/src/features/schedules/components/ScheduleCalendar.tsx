'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import type { CalendarEvent, ScheduleConflict } from '../types'

export interface ScheduleCalendarProps {
  events: CalendarEvent[]
  conflicts: ScheduleConflict[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  view?: 'month' | 'week' | 'day'
  onViewChange?: (view: 'month' | 'week' | 'day') => void
  className?: string
}

/**
 * ScheduleCalendar Component
 * Calendar view with conflict visualization for schedule management
 */
export function ScheduleCalendar({
  events,
  conflicts,
  onEventClick,
  onDateClick,
  view = 'month',
  onViewChange,
  className = '',
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  const getConflictsForDate = (date: Date) => {
    return conflicts.filter((conflict) => {
      if (!conflict.timeRange) return false
      const conflictDate = new Date(conflict.timeRange.start)
      return (
        conflictDate.getFullYear() === date.getFullYear() &&
        conflictDate.getMonth() === date.getMonth() &&
        conflictDate.getDate() === date.getDate()
      )
    })
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-200 min-h-24" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const dayConflicts = getConflictsForDate(date)
      const isToday =
        new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => onDateClick?.(date)}
          className={`border border-gray-200 min-h-24 p-2 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-sm font-semibold ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </span>
            {dayConflicts.length > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                !
              </span>
            )}
          </div>

          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onEventClick?.(event)
                }}
                className="text-xs px-2 py-1 rounded truncate hover:opacity-80"
                style={{
                  backgroundColor: event.color || '#3b82f6',
                  color: 'white',
                }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 pl-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dayEvents = getEventsForDate(date)
      const dayConflicts = getConflictsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0">
          <div
            className={`p-3 border-b border-gray-200 font-semibold text-center ${
              isToday ? 'bg-blue-50 text-blue-600' : 'bg-gray-50'
            }`}
          >
            <div className="text-xs text-gray-600">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg">{date.getDate()}</div>
            {dayConflicts.length > 0 && (
              <div className="text-xs text-red-600 font-bold">⚠️ Conflicts</div>
            )}
          </div>
          <div className="p-2 space-y-2 min-h-96">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="text-xs p-2 rounded cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: event.color || '#3b82f6',
                  color: 'white',
                }}
              >
                <div className="font-semibold truncate">{event.title}</div>
                <div className="text-xs opacity-90">
                  {new Date(event.start).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {formatMonthYear(currentDate)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {onViewChange && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  view === v
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0">{renderMonthView()}</div>
        </div>
      )}

      {view === 'week' && (
        <div className="flex border-t border-gray-200">{renderWeekView()}</div>
      )}

      {view === 'day' && (
        <div className="p-4">
          <div className="text-center text-lg font-semibold mb-4">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="space-y-2">
            {getEventsForDate(currentDate).map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-4 rounded-lg cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: event.color || '#3b82f6',
                  color: 'white',
                }}
              >
                <div className="font-semibold text-lg">{event.title}</div>
                <div className="text-sm opacity-90">
                  {new Date(event.start).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(event.end).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-sm opacity-75 mt-1">
                  Priority: {event.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflict Summary */}
      {conflicts.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-semibold">
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
