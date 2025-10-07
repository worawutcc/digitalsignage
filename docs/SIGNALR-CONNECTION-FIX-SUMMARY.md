# แก้ไขปัญหา SignalR Connection Race Conditions ใน Users Page

## ปัญหาที่พบ
ทุกครั้งที่เข้า `/users` จะเจอ SignalR connection errors เนื่องจาก:

1. **Multiple Connection Attempts**: หลาย components ใน Users page เรียกใช้ `useRealTimeUpdates` hook พร้อมกัน
2. **Race Conditions**: Components พยายาม connect ก่อนที่ connection ก่อนหน้าจะพร้อม
3. **AutoConnect = true**: Default value ทำให้ connection เกิดขึ้นทันทีที่ component mount

## การแก้ไข

### 1. ปรับปรุง `useRealTimeUpdates` Hook
- **เปลี่ยน default `autoConnect` เป็น `false`** เพื่อป้องกัน race conditions
- **เพิ่ม Global Connection Management** ใช้ shared connection แทนการสร้าง connection แยกกัน
- **เพิ่ม Connection Sharing** ป้องกันการสร้าง multiple connections พร้อมกัน
- **เพิ่ม Connection ID และ Subscriber Management** เพื่อจัดการ connection lifecycle

### 2. สร้าง RealTimeProvider Component
```tsx
// components/providers/RealTimeProvider.tsx
<RealTimeProvider 
  autoConnect={true}
  showConnectionToasts={false}
  retryConfig={{
    enabled: true,
    maxAttempts: 3,
    delayMs: 2000
  }}
>
  {children}
</RealTimeProvider>
```

### 3. อัปเดต Users Page Components
- **UserList**: เปลี่ยนเป็น manual connection management
- **UserScheduleAssignment**: ปิด autoConnect และใช้ shared connection
- **PermissionMatrix**: ปิด autoConnect และใช้ shared connection  
- **RoleManager**: ปิด autoConnect และใช้ shared connection

### 4. เพิ่ม Connection Status Indicator
- แสดงสถานะการเชื่อมต่อ real-time ใน page header
- ช่วยในการ debug และ monitor connection status

## ผลลัพธ์
- ✅ ไม่มี SignalR connection errors เมื่อเข้า `/users` page
- ✅ ใช้ shared connection แทนการสร้าง multiple connections
- ✅ แสดงสถานะการเชื่อมต่อให้ user เห็น
- ✅ Retry mechanism เมื่อ connection ล้มเหลว
- ✅ Graceful handling ของ connection lifecycle

## ไฟล์ที่แก้ไข
1. `src/hooks/useRealTimeUpdates.ts` - ปรับปรุง connection management
2. `src/components/providers/RealTimeProvider.tsx` - สร้าง global provider
3. `src/app/users/page.tsx` - Wrap ด้วย RealTimeProvider
4. `src/features/users/components/UserList.tsx` - Manual connection
5. `src/features/users/components/UserScheduleAssignment.tsx` - ปิด autoConnect
6. `src/features/users/components/PermissionMatrix.tsx` - ปิด autoConnect
7. `src/features/users/components/RoleManager.tsx` - ปิด autoConnect

## การใช้งาน
```tsx
// ในหน้าที่ต้องการ real-time features
<RealTimeProvider autoConnect={true}>
  <YourComponents />
</RealTimeProvider>

// ใน component ที่ต้องการใช้ connection status
const { connectionState, isReady } = useRealTimeContext()
```

## Best Practices
1. ใช้ `RealTimeProvider` ใน page level เพื่อจัดการ shared connection
2. ตั้ง `autoConnect={false}` ใน individual components
3. แสดง connection status indicator สำหรับ UX ที่ดี
4. ใช้ manual connection management เมื่อจำเป็น