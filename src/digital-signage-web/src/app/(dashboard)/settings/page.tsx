'use client';

// Force dynamic rendering for dynamic content
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings as SettingsIcon,
  Monitor,
  Shield, 
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Save
} from 'lucide-react';
import { 
  useSettings, 
  useSettingsByCategory, 
  useUpdateSettings, 
  useResetSettings,
  useCanModifySettings 
} from '@/hooks/useSettings';
import type { SystemSetting } from '@/services/settingsService';

/**
 * Available setting categories with icons and labels
 */
const SETTING_CATEGORIES = [
  { key: 'General', label: 'General', icon: SettingsIcon },
  { key: 'Display', label: 'Display', icon: Monitor },  
  { key: 'Security', label: 'Security', icon: Shield },
  { key: 'Media', label: 'Media', icon: Image },
] as const;

/**
 * Dynamic schema builder for settings form
 */
const createSettingsSchema = (settings: SystemSetting[]) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  
  settings.forEach(setting => {
    if (setting.isReadOnly) return;
    
    let field: z.ZodTypeAny;
    
    switch (setting.dataType) {
      case 'string':
        field = z.string().min(1, `${setting.displayName} is required`);
        break;
      case 'number':
        field = z.number().min(0, `${setting.displayName} must be positive`);
        break;
      case 'boolean':
        field = z.boolean();
        break;
      default:
        field = z.string();
    }
    
    schemaFields[setting.key] = field;
  });
  
  return z.object(schemaFields);
};

/**
 * Settings page component for system configuration management
 * 
 * Features:
 * - Category-based settings organization (General, Display, Security, Media)
 * - Dynamic form generation based on setting data types
 * - Real-time validation and saving
 * - Reset to defaults functionality
 * - Read-only setting protection
 * - Admin permission checking
 */
export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('General');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch settings data
  const { data: allSettings, isLoading: allSettingsLoading } = useSettings();
  const { data: categorySettings, isLoading: categoryLoading } = useSettingsByCategory(activeCategory);
  
  // Mutations
  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();
  const canModify = useCanModifySettings();

  // Dynamic form based on current category settings
  const form = useForm<Record<string, any>>(
    categorySettings 
      ? { resolver: zodResolver(createSettingsSchema(categorySettings)) }
      : {}
  );

  // Update form values when category settings load
  useEffect(() => {
    if (categorySettings) {
      const formData: Record<string, any> = {};
      categorySettings.forEach(setting => {
        let value: any = setting.value;
        
        // Convert string values to appropriate types for form
        if (setting.dataType === 'number') {
          value = parseFloat(value) || 0;
        } else if (setting.dataType === 'boolean') {
          value = value === 'true';
        }
        
        formData[setting.key] = value;
      });
      
      form.reset(formData);
    }
  }, [categorySettings, form]);

  // Handle form submission
  const handleSaveSettings = async (formData: Record<string, any>) => {
    if (!categorySettings) return;
    
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const settingsToUpdate = categorySettings
        .filter(setting => !setting.isReadOnly)
        .map(setting => ({
          key: setting.key,
          value: String(formData[setting.key])
        }));
      
      await updateSettings.mutateAsync({
        settings: settingsToUpdate
      });
      
      setSuccessMessage(`${activeCategory} settings saved successfully`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Handle reset to defaults
  const handleResetCategory = async () => {
    if (!window.confirm(`Reset all ${activeCategory} settings to default values?`)) {
      return;
    }
    
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await resetSettings.mutateAsync(activeCategory);
      setSuccessMessage(`${activeCategory} settings reset to defaults`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to reset settings');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Render setting input based on data type
  const renderSettingInput = (setting: SystemSetting) => {
    const fieldName = setting.key;
    const isDisabled = setting.isReadOnly || !canModify;
    
    if (setting.dataType === 'boolean') {
      return (
        <div className="flex items-center space-x-3">
          <input
            {...form.register(fieldName)}
            type="checkbox"
            disabled={isDisabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
          />
          <span className="text-sm text-gray-600">
            {setting.description || 'Enable this option'}
          </span>
        </div>
      );
    }
    
    if (setting.dataType === 'number') {
      return (
        <input
          {...form.register(fieldName, { valueAsNumber: true })}
          type="number"
          disabled={isDisabled}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
          placeholder={setting.description}
        />
      );
    }
    
    // Default to string input
    return (
      <input
        {...form.register(fieldName)}
        type="text"
        disabled={isDisabled}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
        placeholder={setting.description}
      />
    );
  };

  // Loading state
  if (allSettingsLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide preferences and behaviors</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <p className="text-sm text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Category Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <nav className="space-y-1">
              {SETTING_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const isActive = activeCategory === category.key;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="mr-3 h-5 w-5" />
                    {category.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeCategory} Settings
                </h2>
                {canModify && (
                  <button
                    onClick={handleResetCategory}
                    disabled={resetSettings.isPending}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={form.handleSubmit(handleSaveSettings)} className="p-6">
              <div className="space-y-6">
                {categorySettings?.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {setting.displayName}
                      {setting.isReadOnly && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Read-only
                        </span>
                      )}
                    </label>
                    
                    {renderSettingInput(setting)}
                    
                    {setting.description && setting.dataType !== 'boolean' && (
                      <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                    )}
                    
                    {form.formState.errors[setting.key] && (
                      <p className="mt-1 text-sm text-red-600">
                        {String(form.formState.errors[setting.key]?.message || 'Invalid value')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {canModify && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateSettings.isPending || !form.formState.isDirty}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {updateSettings.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}