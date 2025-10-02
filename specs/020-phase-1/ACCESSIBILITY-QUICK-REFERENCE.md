# Accessibility Quick Reference Guide

## ARIA Attributes Cheat Sheet

### Modal Dialog
```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Title</h2>
  <p id="modal-description">Description</p>
</div>
```

### Alert/Warning
```typescript
<div role="alert" aria-live="polite">
  Critical information
</div>
```

### Search Input
```typescript
<div role="search">
  <label htmlFor="search" className="sr-only">
    Search description
  </label>
  <input
    id="search"
    type="search"
    aria-label="Search description"
    aria-describedby="search-help"
  />
  <span id="search-help" className="sr-only">
    Help text
  </span>
</div>
```

### Checkbox with Details
```typescript
<label aria-label="Full context for screen reader">
  <input
    type="checkbox"
    aria-checked={isChecked}
    aria-describedby="details"
  />
  <div id="details">Details content</div>
</label>
```

### Button States
```typescript
<Button
  disabled={!canSubmit}
  aria-disabled={!canSubmit}
  aria-busy={isLoading}
  aria-label="Full button context"
  aria-describedby={!canSubmit ? 'help' : undefined}
>
  Submit
</Button>
{!canSubmit && (
  <span id="help" className="sr-only">
    Why button is disabled
  </span>
)}
```

### Live Region (Dynamic Content)
```typescript
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {count} items selected
</div>
```

### Decorative vs Functional Icons
```typescript
{/* Decorative - hide from screen reader */}
<Search aria-hidden="true" />

{/* Functional - provide label */}
<Loader2 aria-label="Loading" />
```

---

## Keyboard Navigation Patterns

### Standard Controls
- **Tab**: Move to next element
- **Shift+Tab**: Move to previous element
- **Enter**: Activate button/link
- **Space**: Toggle checkbox, activate button
- **Escape**: Close modal/dropdown

### Focus Management
```typescript
// Auto-focus on modal open
useEffect(() => {
  if (isOpen) {
    firstElementRef.current?.focus()
  }
}, [isOpen])

// Trap focus in modal
const handleTab = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}
```

---

## Color Contrast Requirements

### WCAG 2.1 AA Standards
- **Normal text**: ≥ 4.5:1 contrast ratio
- **Large text** (≥18pt or ≥14pt bold): ≥ 3:1
- **UI components**: ≥ 3:1

### Safe Color Combinations
```css
/* Text on white background */
--gray-900: #1F2937; /* 16.1:1 ✅ AAA */
--gray-600: #4B5563; /* 7.0:1 ✅ AAA */
--blue-600: #2563EB; /* 8.6:1 ✅ AAA */

/* Text on colored backgrounds */
--success-text: #166534; /* on #BBF7D0 = 7.2:1 ✅ */
--warning-text: #78350F; /* on #FEF3C7 = 10.1:1 ✅ */
--error-text: #991B1B; /* on #FEE2E2 = 8.9:1 ✅ */
```

### Check Contrast
```bash
# Use browser DevTools
# Inspect element → Color picker → Contrast ratio shown
```

---

## Screen Reader Only Content

### sr-only Class (Already in Tailwind)
```typescript
<span className="sr-only">
  Content visible only to screen readers
</span>
```

### CSS (If needed)
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Common Mistakes to Avoid

### ❌ Don't
```typescript
// Missing label
<input type="text" placeholder="Search" />

// Div button (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// Color-only information
<span className="text-red-600">Error</span>

// Nested interactive elements
<button>
  <a href="/link">Click</a>
</button>

// Decorative icon announced
<AlertTriangle />
```

### ✅ Do
```typescript
// Proper label
<label htmlFor="search">Search</label>
<input id="search" type="text" />

// Real button
<button onClick={handleClick}>Click me</button>

// Text + color
<span className="text-red-600">
  <AlertCircle aria-hidden="true" />
  Error: Invalid input
</span>

// Separate interactive elements
<div>
  <button onClick={handleClick}>Button</button>
  <a href="/link">Link</a>
</div>

// Hide decorative
<AlertTriangle aria-hidden="true" />
```

---

## Testing Checklist

### Before Commit
- [ ] All interactive elements have labels
- [ ] Color not sole indicator
- [ ] Keyboard navigation works
- [ ] Focus visible on all elements
- [ ] Decorative icons marked `aria-hidden="true"`

### Before PR Review
- [ ] Run axe DevTools (0 violations)
- [ ] Test keyboard-only navigation
- [ ] Check color contrast (≥4.5:1)
- [ ] Verify dynamic content has live regions

### Before Production
- [ ] Screen reader test (VoiceOver or NVDA)
- [ ] Zoom to 200% (no content clipped)
- [ ] Dark mode contrast maintained
- [ ] Mobile touch targets ≥44px

---

## Quick Test Commands

### Run axe DevTools
```bash
# 1. Install browser extension
# 2. Open DevTools → axe DevTools tab
# 3. Click "Scan All of My Page"
# 4. Fix all violations
```

### Test with Keyboard
```bash
# 1. Disconnect mouse (force keyboard)
# 2. Tab through entire page
# 3. Verify all elements reachable
# 4. Check focus indicators visible
# 5. Use Enter/Space to activate
```

### Test with Screen Reader
```bash
# macOS VoiceOver
Cmd+F5                # Toggle VoiceOver
Ctrl+Option+Arrow     # Navigate
Ctrl+Option+Space     # Activate

# Windows NVDA
Ctrl+Alt+N           # Start NVDA
Arrow Keys           # Navigate (browse mode)
Enter                # Activate
```

---

## Resources

### Documentation
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/

### Tools
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- NVDA: https://www.nvaccess.org/
- Lighthouse: Built into Chrome DevTools

### React
- React ARIA: https://react-spectrum.adobe.com/react-aria/
- Radix UI: https://www.radix-ui.com/
- Testing Library: https://testing-library.com/docs/queries/byrole/

---

## Need Help?

See **T056-ACCESSIBILITY-AUDIT.md** for:
- Complete WCAG checklist
- Component-by-component analysis
- Detailed testing procedures
- Screen reader announcement patterns

**Remember**: Accessibility is not optional—it's a requirement for production deployment.
