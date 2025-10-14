'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { 
  Settings, 
  Monitor, 
  Clock, 
  Repeat, 
  Volume2, 
  Tv,
  Timer,
  Zap,
  Palette,
  Layout,
  Info,
  Save,
  RotateCcw
} from 'lucide-react'

interface PlaylistSettingsData {
  // Playback Settings
  isLooped: boolean
  autoPlay: boolean
  preloadNext: boolean
  
  // Timing Settings
  defaultItemDuration: number
  transitionDuration: number
  pauseBetweenItems: number
  
  // Display Settings
  transitionType: 'fade' | 'slide' | 'cut' | 'dissolve' | 'wipe'
  backgroundColor: string
  aspectRatio: 'auto' | '16:9' | '4:3' | '1:1' | 'custom'
  customWidth?: number
  customHeight?: number
  
  // Audio Settings
  masterVolume: number
  fadeInDuration: number
  fadeOutDuration: number
  
  // Quality Settings
  videoQuality: 'auto' | 'high' | 'medium' | 'low'
  imageCompression: boolean
  
  // Scheduling Settings
  timeZone: string
  startTime?: string
  endTime?: string
  activeDays: number[] // 0-6, Sunday-Saturday
  
  // Advanced Settings
  errorHandling: 'skip' | 'retry' | 'fallback'
  retryAttempts: number
  fallbackMedia?: number
  enableAnalytics: boolean
}

interface Playlist {
  id: number
  name: string
  settings?: Partial<PlaylistSettingsData>
}

interface PlaylistSettingsProps {
  playlist?: Playlist | null
  onChange: (settings: Partial<PlaylistSettingsData>) => void
  onSave?: () => void
  isLoading?: boolean
  className?: string
}

const TRANSITION_TYPES = [
  { value: 'fade', label: 'Fade', description: 'Gradual opacity transition' },
  { value: 'slide', label: 'Slide', description: 'Horizontal sliding motion' },
  { value: 'cut', label: 'Cut', description: 'Instant transition' },
  { value: 'dissolve', label: 'Dissolve', description: 'Cross-fade effect' },
  { value: 'wipe', label: 'Wipe', description: 'Directional wipe transition' }
] as const

const ASPECT_RATIOS = [
  { value: 'auto', label: 'Auto', description: 'Use original dimensions' },
  { value: '16:9', label: '16:9', description: 'Widescreen (1920x1080)' },
  { value: '4:3', label: '4:3', description: 'Standard (1024x768)' },
  { value: '1:1', label: '1:1', description: 'Square (1080x1080)' },
  { value: 'custom', label: 'Custom', description: 'Custom dimensions' }
] as const

const VIDEO_QUALITIES = [
  { value: 'auto', label: 'Auto', description: 'Automatic quality selection' },
  { value: 'high', label: 'High', description: '1080p+ when available' },
  { value: 'medium', label: 'Medium', description: '720p quality' },
  { value: 'low', label: 'Low', description: '480p quality' }
] as const

const ERROR_HANDLING_OPTIONS = [
  { value: 'skip', label: 'Skip', description: 'Skip problematic items' },
  { value: 'retry', label: 'Retry', description: 'Attempt to reload' },
  { value: 'fallback', label: 'Fallback', description: 'Use fallback media' }
] as const

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' }
] as const

export function PlaylistSettings({
  playlist,
  onChange,
  onSave,
  isLoading = false,
  className
}: PlaylistSettingsProps) {
  // Initialize settings with defaults
  const [settings, setSettings] = useState<PlaylistSettingsData>({
    // Playback Settings
    isLooped: true,
    autoPlay: true,
    preloadNext: true,
    
    // Timing Settings
    defaultItemDuration: 10,
    transitionDuration: 1000,
    pauseBetweenItems: 0,
    
    // Display Settings
    transitionType: 'fade',
    backgroundColor: '#000000',
    aspectRatio: 'auto',
    
    // Audio Settings
    masterVolume: 80,
    fadeInDuration: 500,
    fadeOutDuration: 500,
    
    // Quality Settings
    videoQuality: 'auto',
    imageCompression: true,
    
    // Scheduling Settings
    timeZone: 'UTC',
    activeDays: [1, 2, 3, 4, 5], // Weekdays by default
    
    // Advanced Settings
    errorHandling: 'skip',
    retryAttempts: 3,
    enableAnalytics: true,
    
    // Override with playlist settings
    ...playlist?.settings
  })

  const [isDirty, setIsDirty] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('playback')

  // Track changes
  useEffect(() => {
    if (isDirty) {
      onChange(settings)
    }
  }, [settings, isDirty, onChange])

  const handleSettingChange = (key: keyof PlaylistSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const handleReset = () => {
    const defaultSettings = {
      isLooped: true,
      autoPlay: true,
      preloadNext: true,
      defaultItemDuration: 10,
      transitionDuration: 1000,
      pauseBetweenItems: 0,
      transitionType: 'fade' as const,
      backgroundColor: '#000000',
      aspectRatio: 'auto' as const,
      masterVolume: 80,
      fadeInDuration: 500,
      fadeOutDuration: 500,
      videoQuality: 'auto' as const,
      imageCompression: true,
      timeZone: 'UTC',
      activeDays: [1, 2, 3, 4, 5],
      errorHandling: 'skip' as const,
      retryAttempts: 3,
      enableAnalytics: true,
      ...playlist?.settings
    }
    setSettings(defaultSettings)
    setIsDirty(false)
  }

  const handleSave = () => {
    onSave?.()
    setIsDirty(false)
  }

  const sections = [
    { id: 'playback', label: 'Playback', icon: Repeat },
    { id: 'timing', label: 'Timing', icon: Clock },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'quality', label: 'Quality', icon: Zap },
    { id: 'scheduling', label: 'Schedule', icon: Timer },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ]

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-gray-700" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Playlist Settings</h2>
              <p className="text-sm text-gray-600">Configure playback and display options</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isDirty && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>Unsaved changes</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              size="sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r bg-gray-50 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors',
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'playback' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Playback Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.isLooped}
                      onChange={(e) => handleSettingChange('isLooped', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium">Loop Playlist</span>
                      <p className="text-sm text-gray-600">Restart from the beginning when playlist ends</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.autoPlay}
                      onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium">Auto Play</span>
                      <p className="text-sm text-gray-600">Start playing automatically when loaded</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.preloadNext}
                      onChange={(e) => handleSettingChange('preloadNext', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium">Preload Next Item</span>
                      <p className="text-sm text-gray-600">Load next media in background for smoother transitions</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'timing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Timing Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Item Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={settings.defaultItemDuration}
                      onChange={(e) => handleSettingChange('defaultItemDuration', Number(e.target.value))}
                      min="1"
                      max="3600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default display time for images and HTML content</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transition Duration (ms)
                    </label>
                    <Input
                      type="number"
                      value={settings.transitionDuration}
                      onChange={(e) => handleSettingChange('transitionDuration', Number(e.target.value))}
                      min="0"
                      max="5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Time for transition between items</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pause Between Items (ms)
                    </label>
                    <Input
                      type="number"
                      value={settings.pauseBetweenItems}
                      onChange={(e) => handleSettingChange('pauseBetweenItems', Number(e.target.value))}
                      min="0"
                      max="10000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional pause between media items</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'display' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transition Type
                    </label>
                    <select
                      value={settings.transitionType}
                      onChange={(e) => handleSettingChange('transitionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TRANSITION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.backgroundColor}
                        onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aspect Ratio
                    </label>
                    <select
                      value={settings.aspectRatio}
                      onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ASPECT_RATIOS.map((ratio) => (
                        <option key={ratio.value} value={ratio.value}>
                          {ratio.label} - {ratio.description}
                        </option>
                      ))}
                    </select>
                    
                    {settings.aspectRatio === 'custom' && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Width</label>
                          <Input
                            type="number"
                            value={settings.customWidth || ''}
                            onChange={(e) => handleSettingChange('customWidth', Number(e.target.value))}
                            placeholder="1920"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Height</label>
                          <Input
                            type="number"
                            value={settings.customHeight || ''}
                            onChange={(e) => handleSettingChange('customHeight', Number(e.target.value))}
                            placeholder="1080"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'audio' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Master Volume: {settings.masterVolume}%
                    </label>
                    <input
                      type="range"
                      value={settings.masterVolume}
                      onChange={(e) => handleSettingChange('masterVolume', Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fade In Duration (ms)
                      </label>
                      <Input
                        type="number"
                        value={settings.fadeInDuration}
                        onChange={(e) => handleSettingChange('fadeInDuration', Number(e.target.value))}
                        min="0"
                        max="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fade Out Duration (ms)
                      </label>
                      <Input
                        type="number"
                        value={settings.fadeOutDuration}
                        onChange={(e) => handleSettingChange('fadeOutDuration', Number(e.target.value))}
                        min="0"
                        max="5000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'quality' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quality Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Quality
                    </label>
                    <select
                      value={settings.videoQuality}
                      onChange={(e) => handleSettingChange('videoQuality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {VIDEO_QUALITIES.map((quality) => (
                        <option key={quality.value} value={quality.value}>
                          {quality.label} - {quality.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.imageCompression}
                      onChange={(e) => handleSettingChange('imageCompression', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium">Enable Image Compression</span>
                      <p className="text-sm text-gray-600">Optimize images for faster loading</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'scheduling' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={settings.startTime || ''}
                        onChange={(e) => handleSettingChange('startTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={settings.endTime || ''}
                        onChange={(e) => handleSettingChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Active Days
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => {
                            const activeDays = settings.activeDays.includes(day.value)
                              ? settings.activeDays.filter(d => d !== day.value)
                              : [...settings.activeDays, day.value]
                            handleSettingChange('activeDays', activeDays)
                          }}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                            settings.activeDays.includes(day.value)
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          )}
                          title={day.fullLabel}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Handling
                    </label>
                    <select
                      value={settings.errorHandling}
                      onChange={(e) => handleSettingChange('errorHandling', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ERROR_HANDLING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {settings.errorHandling === 'retry' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retry Attempts
                      </label>
                      <Input
                        type="number"
                        value={settings.retryAttempts}
                        onChange={(e) => handleSettingChange('retryAttempts', Number(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.enableAnalytics}
                      onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium">Enable Analytics</span>
                      <p className="text-sm text-gray-600">Collect playback statistics and performance data</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistSettings