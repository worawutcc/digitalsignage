# Quickstart Guide: UI Error Notification Enhancement

**Feature**: UI Error Notification Enhancement & API Error Handling  
**Date**: 2025-10-13  
**Duration**: ~2-3 hours implementation + testing

## Overview

This feature adds comprehensive error handling and user notifications across all admin pages in the Digital Signage web application. Users will receive immediate feedback when API calls fail, form validation errors occur, or network issues arise.

## Quick Implementation Checklist

### ✅ Phase 1: Core Error Infrastructure (45 mins)
1. **Error Store Setup** (15 mins)
   - [ ] Create Redux error slice with actions/selectors
   - [ ] Add error state types in TypeScript definitions
   - [ ] Configure store to include error reducer

2. **API Client Enhancement** (20 mins)  
   - [ ] Add Axios error interceptor for standardized error handling
   - [ ] Map backend ProblemDetails to frontend ApiError types
   - [ ] Implement retry logic for network failures

3. **Error Context Provider** (10 mins)
   - [ ] Create ErrorContext with React Context API
   - [ ] Provide error actions (show/clear/dismiss) app-wide
   - [ ] Wrap App component with ErrorProvider

### ✅ Phase 2: Core Components (60 mins)
1. **Error Boundary Component** (20 mins)
   - [ ] Implement React Error Boundary for unhandled errors
   - [ ] Create fallback UI for critical errors  
   - [ ] Add error reporting integration

2. **Toast Notification System** (25 mins)
   - [ ] Create Toast component with animation
   - [ ] Implement ToastContainer for positioning/management
   - [ ] Add auto-dismiss and manual dismiss functionality

3. **Loading States** (15 mins)
   - [ ] Create LoadingOverlay component for API operations
   - [ ] Add LoadingSpinner with error state handling
   - [ ] Implement skeleton loading for data tables

### ✅ Phase 3: Form Error Handling (45 mins)
1. **Form Error Components** (25 mins)
   - [ ] Create FormFieldError for inline validation errors
   - [ ] Add FormSummaryError for form-level error display
   - [ ] Implement Zod error mapping utilities

2. **Form Integration** (20 mins)
   - [ ] Integrate error components with React Hook Form
   - [ ] Add error handling to existing form pages
   - [ ] Test form validation error display

### ✅ Phase 4: Page Integration (30 mins)
1. **Layout Integration** (15 mins)
   - [ ] Add ErrorBoundary to root layout
   - [ ] Insert ToastContainer in admin layout
   - [ ] Configure error boundary levels per page

2. **Existing Page Updates** (15 mins)
   - [ ] Add error handling to Users management page
   - [ ] Update Media upload with error feedback
   - [ ] Enhance Device management error states

## Development Setup

### 1. Install Dependencies (if needed)
```bash
cd src/digital-signage-web
npm install react-hot-toast lucide-react
# All other dependencies already available
```

### 2. Environment Preparation
```bash
# Ensure development server is running
npm run dev

# Start backend API (separate terminal)
cd ../DigitalSignage.Api
dotnet run
```

### 3. Create Feature Branch (already exists)
```bash
# Current branch: 035-recheck-ui-and
git status  # Confirm branch
```

## Testing Scenarios

### Error Scenario Testing
1. **API Errors**
   ```bash
   # Stop backend API to test network errors
   # Try creating/editing users, media, devices
   # Verify toast notifications appear
   ```

2. **Form Validation**
   ```bash
   # Submit forms with invalid data
   # Check field-level error messages
   # Verify form summary errors
   ```

3. **Network Issues**
   ```bash
   # Disable network in browser DevTools
   # Test offline error states
   # Verify retry functionality
   ```

## Key Files to Create/Modify

### New Files (Create)
```
src/digital-signage-web/src/
├── store/slices/errorSlice.ts          # Redux error management
├── components/errors/
│   ├── ErrorBoundary.tsx               # React error boundary
│   ├── ToastContainer.tsx              # Toast notification system
│   ├── ErrorToast.tsx                  # Individual toast component
│   ├── LoadingOverlay.tsx              # Loading with error states
│   ├── FormFieldError.tsx              # Form field errors
│   └── FormSummaryError.tsx            # Form summary errors
├── lib/errors/
│   ├── errorService.ts                 # Error handling service
│   ├── apiErrorHandler.ts              # API error interceptor
│   └── errorUtils.ts                   # Error utility functions
└── types/errors.ts                     # Error type definitions
```

### Files to Modify
```
src/digital-signage-web/src/
├── app/layout.tsx                      # Add ErrorBoundary + ToastContainer
├── lib/api/client.ts                   # Add error interceptor
├── store/store.ts                      # Include error reducer
└── components/forms/                   # Add error handling to forms
    ├── UserForm.tsx
    ├── MediaUploadForm.tsx
    └── DeviceForm.tsx
```

## Testing Commands

### Unit Tests
```bash
# Test error components
npm test -- --testPathPattern=errors

# Test error service
npm test -- --testNamePattern="error service"

# Test form error handling  
npm test -- --testNamePattern="form errors"
```

### Integration Tests
```bash
# Test error boundary integration
npm test -- --testPathPattern=ErrorBoundary

# Test API error handling
npm test -- --testNamePattern="API errors"
```

### Manual Testing Checklist
- [ ] **Toast Notifications**: API errors show toast messages
- [ ] **Form Errors**: Invalid form data shows field errors  
- [ ] **Loading States**: API calls show loading + error states
- [ ] **Error Recovery**: Retry buttons work correctly
- [ ] **Error Boundaries**: Component crashes show fallback UI
- [ ] **Accessibility**: Screen readers announce errors
- [ ] **Responsive**: Error UI works on mobile/tablet
- [ ] **Consistency**: Same error types show same messages across pages

## Configuration

### Error Display Settings
```typescript
// src/lib/errors/config.ts
export const ERROR_CONFIG = {
  toast: {
    duration: 5000,           // 5 second auto-dismiss
    position: 'top-right',    // Toast position
    maxVisible: 3             // Max simultaneous toasts
  },
  retry: {
    maxAttempts: 3,          // API retry attempts
    backoffFactor: 2,        // Exponential backoff
    initialDelay: 1000       // 1 second initial delay
  },
  forms: {
    scrollToError: true,     // Auto-scroll to first error
    showFieldErrors: true,   // Show inline field errors
    showSummaryErrors: true  // Show form summary errors
  }
};
```

## Development Tips

### 1. Error Message Consistency
- Use centralized error messages for common scenarios
- Map backend error codes to user-friendly messages
- Provide actionable guidance when possible

### 2. Performance Considerations
- Debounce toast notifications to prevent spam
- Use React.memo for error components to prevent unnecessary re-renders
- Implement error deduplication for identical errors

### 3. Accessibility Best Practices
- Use `aria-live` regions for screen reader announcements
- Ensure error messages are descriptive and actionable
- Provide keyboard navigation for error dialogs

### 4. Testing Strategy
- Mock API errors for consistent testing
- Test error boundaries with deliberate React errors
- Verify error recovery flows work correctly

## Completion Criteria

### Functional Requirements Met
- [ ] All admin pages show API error feedback
- [ ] Form validation errors display consistently
- [ ] Loading states indicate progress and errors
- [ ] Users can retry failed operations
- [ ] Error messages are user-friendly and actionable

### Technical Requirements Met  
- [ ] TypeScript types for all error scenarios
- [ ] React Testing Library tests for error components
- [ ] Performance optimizations implemented
- [ ] Accessibility guidelines followed
- [ ] Code follows copilot-instructions-ui.instructions.md patterns

### Ready for Production
- [ ] Error handling tested in development environment
- [ ] No console errors or warnings
- [ ] Error components integrate seamlessly with existing UI
- [ ] Documentation updated with new error handling patterns
- [ ] Feature demonstrates consistent user experience across all admin functions

## Next Steps After Implementation

1. **Monitor Error Rates**: Track which errors occur most frequently
2. **User Feedback**: Gather admin user feedback on error message clarity  
3. **Performance**: Monitor error handling performance impact
4. **Expansion**: Consider extending error handling to public-facing pages
5. **Analytics**: Add error tracking for product improvement insights