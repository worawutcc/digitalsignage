# Device Group Change Validation Fix

## Issue Description

**Problem**: Device group change modal was showing validation error: "Invalid input: expected number, received string"

**Root Cause**: React Hook Form radio inputs always return string values, but the Zod schema was expecting `number | null` type. This type mismatch caused validation to fail when submitting the form.

**Error Location**: `ChangeDeviceGroupModal.tsx` - Form validation and submission

---

## Solution

### 1. Updated Zod Schema

**Before** (Incorrect):
```typescript
const changeGroupSchema = z.object({
  deviceGroupId: z.number().optional().nullable(),
})
```

**After** (Correct):
```typescript
const changeGroupSchema = z.object({
  deviceGroupId: z.string().nullable(),
})
```

**Why**: Radio input values are always strings in HTML/React. We handle the conversion to number in the submit handler instead of in the schema.

---

### 2. Updated Form Default Values

**Before**:
```typescript
defaultValues: {
  deviceGroupId: currentGroupId,  // number | null | undefined
}
```

**After**:
```typescript
defaultValues: {
  deviceGroupId: currentGroupId?.toString() ?? null,  // string | null
}
```

**Why**: Ensures the default value matches the schema type (string).

---

### 3. Updated Submit Handler

**Before**:
```typescript
const onSubmit = async (data: ChangeGroupFormData) => {
  const response = await deviceApi.updateDeviceGroup(deviceId, data.deviceGroupId ?? null)
}
```

**After**:
```typescript
const onSubmit = async (data: ChangeGroupFormData) => {
  // Convert string to number or null
  const deviceGroupId = data.deviceGroupId === null || data.deviceGroupId === '' 
    ? null 
    : Number(data.deviceGroupId)
  
  const response = await deviceApi.updateDeviceGroup(deviceId, deviceGroupId)
}
```

**Why**: Converts the string value from the form to the number type expected by the API.

---

### 4. Updated Radio Button Registration

**Before** (Over-complicated):
```typescript
<input
  type="radio"
  value={group.id}
  {...register('deviceGroupId', {
    setValueAs: (v) => (v === '' ? null : Number(v)),
  })}
/>
```

**After** (Simplified):
```typescript
<input
  type="radio"
  value={group.id.toString()}
  {...register('deviceGroupId')}
/>
```

**Why**: Simpler, clearer, and lets the form work naturally with string values. The conversion happens once in the submit handler.

---

### 5. Updated UI Comparisons

**Before**:
```typescript
selectedGroupId === group.id  // ❌ Comparing string with number
```

**After**:
```typescript
selectedGroupId === group.id.toString()  // ✅ Comparing string with string
```

**Why**: Since `selectedGroupId` is now a string, we need to convert the numeric `group.id` to string for comparison.

---

### 6. Updated "No Group" Option

**Before**:
```typescript
<input
  type="radio"
  value=""
  {...register('deviceGroupId', {
    setValueAs: (v) => (v === '' ? null : Number(v)),
  })}
/>
{selectedGroupId === null && (...)}
```

**After**:
```typescript
<input
  type="radio"
  value=""
  {...register('deviceGroupId')}
/>
{(selectedGroupId === null || selectedGroupId === '') && (...)}
```

**Why**: Empty string `''` is the value for "No Group", so we check for both `null` and `''` in the UI highlight logic.

---

## Key Learnings

### React Hook Form + Radio Buttons + Zod

1. **Radio inputs always return strings** - This is HTML standard behavior
2. **Don't fight the framework** - Use string in schema, convert in submit handler
3. **Type conversions in one place** - Do conversion in `onSubmit`, not scattered across radio buttons
4. **Avoid `setValueAs` with radio buttons** - It complicates things and can cause issues
5. **Match schema types with form control types** - String inputs → string schema

### Best Practice Pattern

```typescript
// 1. Schema accepts strings (natural for radio buttons)
const schema = z.object({
  value: z.string().nullable()
})

// 2. Default values as strings
defaultValues: {
  value: currentValue?.toString() ?? null
}

// 3. Simple registration
<input type="radio" value="123" {...register('value')} />

// 4. Convert in submit handler (one place, clear responsibility)
const onSubmit = (data) => {
  const numericValue = data.value ? Number(data.value) : null
  await api.update(numericValue)
}
```

---

## Testing Checklist

### ✅ Fixed Issues
- [x] No more "Invalid input: expected number, received string" error
- [x] Form submits successfully
- [x] Radio buttons can be selected
- [x] Selected group is highlighted correctly
- [x] "No Group" option works
- [x] Default selection shows current group

### ✅ Validation
- [x] TypeScript compilation passes (no errors)
- [x] Form validation passes
- [x] API receives correct type (number | null)
- [x] UI updates after successful submission

---

## Files Modified

1. `src/digital-signage-web/src/features/devices/components/ChangeDeviceGroupModal.tsx`
   - Updated Zod schema to accept strings
   - Updated default values to use string representation
   - Updated submit handler to convert string → number
   - Simplified radio button registration
   - Fixed UI comparison logic

---

## Related Issues

- **Original Feature**: DEVICE-GROUP-ASSIGNMENT-API-COMPLETE.md
- **Issue Type**: Form validation, type mismatch
- **Severity**: High (blocked functionality)
- **Status**: ✅ Fixed

---

## Screenshots

**Before**: Console error "Invalid input: expected number, received string"  
**After**: Form submits successfully, no errors

---

## Prevention

To avoid similar issues in the future:

1. **Remember HTML form behavior**: Radio/checkbox values are always strings
2. **Test form submission early**: Don't just test UI rendering
3. **Check browser console**: Validation errors are logged there
4. **Use TypeScript**: It would have caught the type mismatch
5. **Keep conversions centralized**: Do type conversions in submit handler, not scattered

---

**Fixed By**: AI Assistant  
**Date**: 2025-10-15  
**Status**: ✅ Complete & Tested
