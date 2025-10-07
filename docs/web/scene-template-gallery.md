# Scene Template Gallery Component

## Overview
Reusable component for browsing and selecting scene templates with filtering capabilities, following React Query patterns and copilot-instructions-ui.instructions.md standards.

## Features
- ✅ React Query integration for data fetching
- ✅ Search functionality
- ✅ Filter by layout type
- ✅ Template selection with visual feedback
- ✅ Preview modal support
- ✅ Responsive grid layout (2, 3, or 4 columns)
- ✅ Loading, error, and empty states
- ✅ TypeScript strict mode
- ✅ Dark mode support

## Usage

### Basic Usage
```tsx
import { SceneTemplateGallery } from '@/components/scenes'
import { SceneDto } from '@/types/scene'

function MyComponent() {
  const handleSelectTemplate = (template: SceneDto) => {
    console.log('Selected:', template)
  }

  return (
    <SceneTemplateGallery
      onSelectTemplate={handleSelectTemplate}
    />
  )
}
```

### With Preview
```tsx
const [previewTemplate, setPreviewTemplate] = useState<SceneDto | null>(null)

<SceneTemplateGallery
  onSelectTemplate={handleSelectTemplate}
  onPreviewTemplate={(template) => setPreviewTemplate(template)}
/>
```

### Filtered by Layout Type
```tsx
import { SceneLayoutType } from '@/types/scene'

<SceneTemplateGallery
  onSelectTemplate={handleSelectTemplate}
  layoutTypeFilter={SceneLayoutType.Grid}
  showFilter={false}  // Hide filter since we're pre-filtering
/>
```

### Custom Grid Layout
```tsx
<SceneTemplateGallery
  onSelectTemplate={handleSelectTemplate}
  columns={4}  // 2, 3, or 4 columns
  showSearch={true}
  showFilter={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSelectTemplate` | `(template: SceneDto) => void` | Yes | - | Callback when template is selected |
| `onPreviewTemplate` | `(template: SceneDto) => void` | No | - | Callback when preview is requested |
| `layoutTypeFilter` | `SceneLayoutType` | No | - | Pre-filter by layout type |
| `className` | `string` | No | `''` | Additional CSS classes |
| `showFilter` | `boolean` | No | `true` | Show layout type filter |
| `showSearch` | `boolean` | No | `true` | Show search bar |
| `columns` | `2 \| 3 \| 4` | No | `3` | Grid columns |

## API Integration

### Backend Endpoint
```
GET /api/scene/templates
```

### Service Method
```typescript
import { SceneService } from '@/services/sceneService'

const templates = await SceneService.getTemplates()
```

### React Query
```typescript
const { data: templates, isLoading, error } = useQuery<SceneDto[], Error>({
  queryKey: ['scene-templates'],
  queryFn: () => SceneService.getTemplates()
})
```

## Layout Types

The component supports all scene layout types with visual indicators:

- **Custom** - Gray
- **Full Screen** - Blue
- **Split Screen** - Green
- **Grid** - Purple
- **Picture in Picture** - Orange
- **Sidebar** - Pink
- **Header** - Indigo
- **Footer** - Teal

## Component Structure

```
SceneTemplateGallery/
├── Search bar (optional)
├── Layout type filter (optional)
├── Loading state (Loader2 spinner)
├── Error state (AlertCircle)
├── Empty state (Layout icon)
└── Templates grid
    └── Template card
        ├── Preview area
        │   ├── Layout icon
        │   ├── Hover preview button
        │   └── Items count badge
        ├── Template info
        │   ├── Name
        │   ├── Description
        │   ├── Layout badge
        │   ├── Dimensions
        │   └── Creator
        └── Selection indicator (Check icon)
```

## Styling

### Dark Mode
All components support dark mode via Tailwind's `dark:` variants:
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### Custom Styling
Pass additional classes via `className` prop:
```tsx
<SceneTemplateGallery
  className="custom-gallery"
  onSelectTemplate={handleSelect}
/>
```

## States

### Loading
```tsx
{isLoading && (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
)}
```

### Error
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <AlertCircle className="h-5 w-5 text-red-500" />
    <p>{error.message}</p>
  </div>
)}
```

### Empty
```tsx
{filteredTemplates.length === 0 && (
  <div className="text-center py-20">
    <Layout className="h-12 w-12 text-gray-400" />
    <h3>No templates found</h3>
  </div>
)}
```

## Examples

### Demo Page
See `/app/scenes/templates/page.tsx` for a complete implementation example with:
- Template selection
- Preview modal
- Navigation
- Use template action

### Integration in Scene Creation
```tsx
// In your scene creation form
const [showTemplateGallery, setShowTemplateGallery] = useState(false)
const [selectedTemplate, setSelectedTemplate] = useState<SceneDto | null>(null)

const handleSelectTemplate = (template: SceneDto) => {
  setSelectedTemplate(template)
  // Populate form with template data
  setValue('layoutType', template.layoutType)
  setValue('width', template.width)
  setValue('height', template.height)
  // Copy scene items...
  setShowTemplateGallery(false)
}

<SceneTemplateGallery
  onSelectTemplate={handleSelectTemplate}
/>
```

## Testing

### Manual Testing
1. Navigate to `/scenes/templates`
2. Verify templates load from API
3. Test search functionality
4. Test layout type filter
5. Test template selection
6. Test preview modal
7. Test responsive layout

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { SceneTemplateGallery } from '@/components/scenes'

test('renders templates', async () => {
  render(
    <SceneTemplateGallery onSelectTemplate={jest.fn()} />
  )
  
  expect(await screen.findByText(/templates/i)).toBeInTheDocument()
})
```

## Related Components
- `Button` - Action buttons
- `Input` - Search input
- `AdminLayout` - Page layout (demo page)
- `Breadcrumbs` - Navigation (demo page)

## Related Services
- `SceneService` - API integration
- `SceneDto` - Type definitions
- `SceneLayoutType` - Layout enum

## Backend Requirements

### Scene Entity
```csharp
public class Scene : BaseEntity
{
    public bool IsTemplate { get; set; }
    public string? TemplateName { get; set; }
    // ... other properties
}
```

### Controller Endpoint
```csharp
[HttpGet("templates")]
public async Task<ActionResult<IEnumerable<SceneDto>>> GetSceneTemplates()
{
    var templates = await _sceneService.GetTemplatesAsync();
    return Ok(templates);
}
```

## Future Enhancements
- [ ] Template categories/tags
- [ ] Template ratings
- [ ] Template usage statistics
- [ ] Favorite templates
- [ ] Custom template creation
- [ ] Template sharing
- [ ] Live preview rendering
- [ ] Drag & drop template items

## Migration from Mock Data
If migrating from mock data:
1. Remove mock template data
2. Add React Query hook
3. Update component to use API data
4. Add loading/error states
5. Test with backend

## Troubleshooting

### Templates Not Loading
- Check API endpoint: `GET /api/scene/templates`
- Verify backend has templates with `IsTemplate = true`
- Check network tab for errors
- Verify CORS configuration

### Layout Icons Not Showing
- Check icon imports from `lucide-react`
- Verify `SceneLayoutType` enum values match

### Selection Not Working
- Verify `onSelectTemplate` callback is provided
- Check console for errors
- Ensure template IDs are unique

## Version History
- v1.0.0 (2025-01-07) - Initial release with React Query integration
