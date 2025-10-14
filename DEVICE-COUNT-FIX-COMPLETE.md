# แก้ไขปัญหา Device Count แสดง 0 ในหน้า Schedules List - เสร็จสิ้น

## สาเหตุของปัญหา 🔍
หน้า schedules list ใช้ `schedule.targetDevices?.length` แทนที่จะใช้ `schedule.deviceCount` ที่เพิ่งเพิ่มใน API response

## การแก้ไข ✅

### 1. แก้ไขใน Card View (บรรทัด 265)
```tsx
// เดิม
{schedule.targetDevices?.length || 0} device(s) • Priority

// แก้เป็น
{schedule.deviceCount || 0} device(s) • Priority
```

### 2. แก้ไขใน Table View (บรรทัด 389)
```tsx
// เดิม
{schedule.targetDevices?.length || 0}

// แก้เป็น
{schedule.deviceCount || 0}
```

### 3. แก้ไขใน User Assignment Panel (บรรทัด 477)
```tsx
// เดิม
<span>Devices: {selectedScheduleForAssignment.targetDevices?.length || 0}</span>

// แก้เป็น
<span>Devices: {selectedScheduleForAssignment.deviceCount || 0}</span>
```

## ไฟล์ที่แก้ไข
- `/src/digital-signage-web/src/app/(dashboard)/schedules/page.tsx`

## ผลลัพธ์ที่คาดหวัง 🎯
- หน้า schedules list จะแสดงจำนวน devices ที่ถูกต้อง (เช่น "2 devices" แทนที่จะเป็น "0 devices")
- ทั้ง card view และ table view จะแสดงข้อมูลสอดคล้องกัน
- หน้า detail ยังคงทำงานถูกต้องเหมือนเดิม

## การทดสอบ
1. ✅ Build ผ่าน (npm run build สำเร็จ)
2. ✅ TypeScript types ผ่าน
3. 🔄 รอการทดสอบใน browser

## หมายเหตุ
ปัญหานี้เกิดจาก:
- API ส่ง `deviceCount` field ใหม่มาแล้ว
- หน้า detail ใช้ `useScheduleById()` ที่ทำงานถูกต้อง  
- แต่หน้า list ใช้ `useSchedules()` ที่ยังเรียก property เก่า `targetDevices?.length`

ตอนนี้แก้ไขแล้วทั้งหมด และ API + Frontend สอดคล้องกันแล้ว!

---
แก้ไขเมื่อ: 2025-01-11
สถานะ: ✅ เสร็จสิ้น