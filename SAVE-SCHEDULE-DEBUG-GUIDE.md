# Debug Guide: Save Schedule ไม่ทำงาน - เพิ่ม Debug Logs แล้ว

## ปัญหา 🚨
ปุ่ม "Save Schedule" สีน้ำเงินและไม่ disabled แต่กดแล้วไม่มี action เกิดขึ้น

## Debug Logs ที่เพิ่มแล้ว 🔍

### 1. Button Click Detection
```typescript
onClick={() => console.log('🖱️ Save button clicked! isFormValid:', isFormValid)}
```

### 2. React Hook Form Submission
```typescript
onSubmit={handleSubmit(
  (data) => {
    console.log('📝 React Hook Form handleSubmit SUCCESS with data:', data)
    onSubmit(data)
  },
  (errors) => {
    console.log('❌ React Hook Form handleSubmit FAILED with errors:', errors)
  }
)}
```

### 3. Custom onSubmit Function
```typescript
console.log('🚀 FORM SUBMISSION STARTED')
console.log('💾 Form submitted with data:', data)
console.log('📊 Form validation state:', { isFormValid, tabValidation })
```

### 4. Parent Component Handler
```typescript
console.log('🎯 handleCreateSchedule called with:', schedule)
console.log('🔄 Calling createMutation.mutateAsync...')
```

### 5. React Query Mutation
```typescript
console.log('🎯 useCreateSchedule mutationFn called with:', schedule)
```

## วิธีการ Debug 📋

### ขั้นตอนที่ 1: เปิด Browser Console
1. กด F12 เปิด DevTools
2. ไปแท็บ Console
3. Clear console (Ctrl+L)

### ขั้นตอนที่ 2: ทดสอบกดปุ่ม Save
1. กรอกข้อมูลในฟอร์มให้ครบ (Basic Info, Time Slots, Target Devices, Content)
2. กดปุ่ม "Save Schedule"
3. ดู console logs ที่ปรากฏ

### ขั้นตอนที่ 3: วิเคราะห์ผลลัพธ์

#### กรณีที่ 1: ไม่เห็น log อะไรเลย
```
🚨 ปัญหา: JavaScript Error หรือ Component ไม่ทำงาน
✅ แก้ไข: ตรวจสอบ Console Errors (แท็บ Console)
```

#### กรณีที่ 2: เห็น "🖱️ Save button clicked!" แต่หยุดตรงนั้น
```
🚨 ปัญหา: Form Validation ล้มเหลว
✅ แก้ไข: ตรวจสอบ isFormValid และ tabValidation ใน log
```

#### กรณีที่ 3: เห็น "❌ React Hook Form handleSubmit FAILED"
```
🚨 ปัญหา: Zod Schema Validation Error
✅ แก้ไข: ดู errors ใน log เพื่อหาฟิลด์ที่ผิด
```

#### กรณีที่ 4: เห็น "📝 React Hook Form handleSubmit SUCCESS" แต่หยุดตรงนั้น
```
🚨 ปัญหา: onSubmit function มีปัญหา
✅ แก้ไข: ตรวจสอบ validation logic ใน onSubmit
```

#### กรณีที่ 5: เห็น "🎯 handleCreateSchedule called" แต่หยุดตรงนั้น
```
🚨 ปัญหา: React Query mutation มีปัญหา
✅ แก้ไข: ตรวจสอบ API endpoint และ network requests
```

## การแก้ไขปัญหาตามขั้นตอน 🛠️

### 1. ตรวจสอบ Form Completeness
ตรวจสอบว่าทุกแท็บมีข้อมูลครบถ้วน:
- ✅ Basic Info: name, startDate, endDate
- ✅ Time Slots: อย่างน้อย 1 time slot with startTime, endTime, daysOfWeek
- ✅ Target Devices: เลือกอย่างน้อย 1 device
- ✅ Content: เลือกอย่างน้อย 1 media file

### 2. ตรวจสอบ API Connection
```bash
# Test API health
curl http://localhost:5100/health

# Test device groups endpoint  
curl http://localhost:5100/api/admin/device-groups
```

### 3. ตรวจสอบ Network Requests
1. เปิด DevTools → Network tab
2. กดปุ่ม Save Schedule
3. ดู HTTP requests ที่เกิดขึ้น
4. ตรวจสอบ status codes และ response

## ไฟล์ที่มีการเพิ่ม Debug Logs 📁
- `/src/digital-signage-web/src/features/schedules/components/ScheduleBuilder.tsx`
- `/src/digital-signage-web/src/app/(dashboard)/schedules/page.tsx` 
- `/src/digital-signage-web/src/features/schedules/hooks/useSchedules.ts`

## การเอา Debug Logs ออก 🧹
หลังจากแก้ไขปัญหาแล้ว ให้เอา console.log ออกทั้งหมด:
```bash
# Search for debug logs
grep -r "console.log" src/digital-signage-web/src/
```

---
**หมายเหตุ:** Debug logs นี้จะช่วยระบุว่าปัญหาอยู่ขั้นตอนไหนของ form submission process

สถานะ: 🔄 พร้อม Debug
วันที่: 2025-01-11