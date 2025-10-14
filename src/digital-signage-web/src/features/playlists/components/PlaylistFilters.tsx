'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  RotateCcw,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlaylistStatus } from '@/types/playlist';

const filterSchema = z.object({
  status: z.array(z.nativeEnum(PlaylistStatus)).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().optional(),
  hasDeviceAssignments: z.boolean().optional(),
  playCountRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  createdBy: z.string().optional(),
});

export type PlaylistFilters = z.infer<typeof filterSchema>;

interface PlaylistFiltersProps {
  filters: PlaylistFilters;
  onFiltersChange: (filters: PlaylistFilters) => void;
  availableTags?: string[];
  availableCreators?: string[];
  className?: string;
}

const statusOptions = [
  { value: PlaylistStatus.Draft, label: 'Draft', color: 'bg-gray-500' },
  { value: PlaylistStatus.Active, label: 'Active', color: 'bg-green-500' },
  { value: PlaylistStatus.Inactive, label: 'Inactive', color: 'bg-red-500' },
  { value: PlaylistStatus.Scheduled, label: 'Scheduled', color: 'bg-blue-500' },
  { value: PlaylistStatus.Expired, label: 'Expired', color: 'bg-orange-500' },
  { value: PlaylistStatus.Error, label: 'Error', color: 'bg-red-600' },
  { value: PlaylistStatus.Archived, label: 'Archived', color: 'bg-gray-400' },
];

export function PlaylistFiltersComponent({
  filters,
  onFiltersChange,
  availableTags = [],
  availableCreators = [],
  className,
}: PlaylistFiltersProps) {
  const { control, handleSubmit, reset, watch, setValue } = useForm<PlaylistFilters>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters,
  });

  const watchedFilters = watch();

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (watchedFilters.status && watchedFilters.status.length > 0) count++;
    if (watchedFilters.dateRange?.from || watchedFilters.dateRange?.to) count++;
    if (watchedFilters.tags && watchedFilters.tags.length > 0) count++;
    if (watchedFilters.isTemplate !== undefined) count++;
    if (watchedFilters.hasDeviceAssignments !== undefined) count++;
    if (watchedFilters.playCountRange?.min !== undefined || watchedFilters.playCountRange?.max !== undefined) count++;
    if (watchedFilters.createdBy) count++;
    return count;
  }, [watchedFilters]);

  const handleApplyFilters = (data: PlaylistFilters) => {
    onFiltersChange(data);
  };

  const handleResetFilters = () => {
    const emptyFilters: PlaylistFilters = {};
    reset(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const removeStatusFilter = (status: PlaylistStatus) => {
    const currentStatus = watchedFilters.status || [];
    const newStatus = currentStatus.filter(s => s !== status);
    setValue('status', newStatus.length > 0 ? newStatus : undefined);
    handleSubmit(handleApplyFilters)();
  };

  const removeTagFilter = (tag: string) => {
    const currentTags = watchedFilters.tags || [];
    const newTags = currentTags.filter(t => t !== tag);
    setValue('tags', newTags.length > 0 ? newTags : undefined);
    handleSubmit(handleApplyFilters)();
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-1">
        {watchedFilters.status?.map((status) => {
          const statusOption = statusOptions.find(opt => opt.value === status);
          return (
            <Badge
              key={status}
              variant="secondary"
              className="gap-1"
            >
              {statusOption?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeStatusFilter(status)}
              />
            </Badge>
          );
        })}
        
        {watchedFilters.tags?.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="gap-1"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeTagFilter(tag)}
            />
          </Badge>
        ))}

        {watchedFilters.isTemplate && (
          <Badge variant="secondary" className="gap-1">
            Templates Only
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => {
                setValue('isTemplate', undefined);
                handleSubmit(handleApplyFilters)();
              }}
            />
          </Badge>
        )}

        {watchedFilters.hasDeviceAssignments && (
          <Badge variant="secondary" className="gap-1">
            With Device Assignments
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => {
                setValue('hasDeviceAssignments', undefined);
                handleSubmit(handleApplyFilters)();
              }}
            />
          </Badge>
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Filter Playlists</SheetTitle>
            <SheetDescription>
              Refine your playlist view with advanced filters
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(handleApplyFilters)} className="space-y-6 mt-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={field.value?.includes(option.value) || false}
                          onChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, option.value]);
                            } else {
                              field.onChange(currentValues.filter(v => v !== option.value));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`status-${option.value}`}
                          className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                        >
                          <div className={cn('w-2 h-2 rounded-full', option.color)} />
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label>Created Date Range</Label>
              <div className="flex gap-2">
                <Controller
                  name="dateRange.from"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal flex-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "MMM dd, yyyy") : "From date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                
                <Controller
                  name="dateRange.to"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal flex-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "MMM dd, yyyy") : "To date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-3">
                <Label>Tags</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={field.value?.includes(tag) || false}
                            onChange={(checked) => {
                              const currentValues = field.value || [];
                              if (checked) {
                                field.onChange([...currentValues, tag]);
                              } else {
                                field.onChange(currentValues.filter(v => v !== tag));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`tag-${tag}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Play Count Range */}
            <div className="space-y-3">
              <Label>Play Count Range</Label>
              <div className="flex gap-2">
                <Controller
                  name="playCountRange.min"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="number"
                      placeholder="Min plays"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
                <Controller
                  name="playCountRange.max"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="number"
                      placeholder="Max plays"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                />
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="space-y-3">
              <Label>Options</Label>
              <div className="space-y-2">
                <Controller
                  name="isTemplate"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isTemplate"
                        checked={value || false}
                        onChange={onChange}
                      />
                      <Label htmlFor="isTemplate" className="text-sm font-normal cursor-pointer">
                        Show only templates
                      </Label>
                    </div>
                  )}
                />
                
                <Controller
                  name="hasDeviceAssignments"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDeviceAssignments"
                        checked={value || false}
                        onChange={onChange}
                      />
                      <Label htmlFor="hasDeviceAssignments" className="text-sm font-normal cursor-pointer">
                        Show only playlists with device assignments
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Created By Filter */}
            {availableCreators.length > 0 && (
              <div className="space-y-3">
                <Label htmlFor="createdBy">Created By</Label>
                <Controller
                  name="createdBy"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select creator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All creators</SelectItem>
                        {availableCreators.map((creator) => (
                          <SelectItem key={creator} value={creator}>
                            {creator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}