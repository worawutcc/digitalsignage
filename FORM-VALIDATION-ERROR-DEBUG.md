# Form Validation Error - Debugging Results

## ปัญหาที่พบ 🚨
React Hook Form handleSubmit **FAILED** with validation errors from Zod schema

## Debug Logs ที่เพิ่มแล้ว 🔍

### 1. Enhanced Error Details
```typescript
console.log('❌ React Hook Form handleSubmit FAILED with errors:', errors)
console.log('🔍 Detailed error breakdown:')
Object.entries(errors).forEach(([field, error]) => {
  console.log(`  • ${field}:`, error)
})
```

### 2. Raw Form Data Inspection  
```typescript
console.log('📊 Current form data:', formData)
console.log('✅ Tab validation:', tabValidation)
```

## การปรับปรุง Schema 🛠️

### 1. เพิ่ม Validation Messages ที่ชัดเจนขึ้น
```typescript
// ปรับ targetDevices
name: z.string().min(1, 'Device name is required'),

// ปรับ content 
mediaId: z.number().min(1, 'Media ID is required'),
mediaName: z.string().min(1, 'Media name is required'),
order: z.number().min(0, 'Order must be 0 or greater'),
```

## วิธีการทดสอบใหม่ 🧪

### ขั้นตอนที่ 1: ดู Error Details
1. เปิด Browser Console (F12)
2. กรอกฟอร์มให้ครบ
3. กดปุ่ม Save Schedule
4. ดู console logs:
   ```
   🖱️ Save button clicked! isFormValid: true
   📊 Current form data: { ... }
   ❌ React Hook Form handleSubmit FAILED with errors: { ... }
   🔍 Detailed error breakdown:
     • fieldName: { message: "error message", type: "validation" }
   ```

### ขั้นตอนที่ 2: แก้ไขตาม Error Messages
**กรณี targetDevices error:**
- ตรวจสอบว่าเลือก devices แล้วหรือยัง
- ตรวจสอบ device name ไม่ว่าง

**กรณี content error:**  
- ตรวจสอบว่าเลือก media files แล้วหรือยัง
- ตรวจสอบ duration เป็นตัวเลข > 0
- ตรวจสอบ order เป็นตัวเลข >= 0

**กรณี timeSlots error:**
- ตรวจสอบ startTime, endTime format (HH:MM)
- ตรวจสอบ daysOfWeek เป็น array ของตัวเลข

### ขั้นตอนที่ 3: ตรวจสอบ Data Types
**ปัญหาที่พบบ่อย:**
```typescript
// ❌ ข้อมูลเป็น string แต่ schema ต้องการ number
deviceId: "123"  // should be: 123

// ❌ ข้อมูลเป็น empty string แต่ schema ต้องการ min length
name: ""  // should be: "Device Name"

// ❌ ข้อมูลเป็น string แต่ schema ต้องการ array
daysOfWeek: "1,2,3"  // should be: [1, 2, 3]
```

## การแก้ไขที่คาดการณ์ 🔧

### 1. ตรวจสอบ Form Fields Binding
ให้ตรวจสอบว่า form fields ใน UI ส่งข้อมูลประเภทที่ถูกต้องหรือไม่

### 2. เพิ่ม Type Conversion
อาจต้องเพิ่ม transformation ก่อน validation:
```typescript
// Convert string to number
deviceId: z.string().transform(val => parseInt(val)).pipe(z.number())

// Convert comma-separated to array
daysOfWeek: z.string().transform(val => val.split(',').map(Number)).pipe(z.array(z.number()))
```

### 3. ทำ Zod Schema แบบ Relaxed
```typescript
// Schema แบบ flexible สำหรับ debug
const debugSchema = scheduleSchema.partial()  // ทำทุก field เป็น optional
```

## Next Steps 📋

1. **ดู Console Errors** - หา field ที่ validation ล้มเหลว
2. **ตรวจสอบ Form Data** - เทียบกับ Schema requirements  
3. **แก้ไข Data Types** - ให้ตรงกับ Zod schema
4. **Test อีกครั้ง** - จนกว่า validation จะผ่าน

---
**Status:** 🔄 Debugging - รอผล Console Logs  
**Date:** 2025-01-11

**คุณลองกดปุ่ม Save อีกครั้งแล้วดู Console ว่า error field ไหนบ้างครับ**