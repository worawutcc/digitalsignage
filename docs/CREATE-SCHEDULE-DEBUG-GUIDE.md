# Create Schedule Debugging Guide

## การตรวจสอบปัญหาการสร้าง Schedule

### 🔍 Steps สำหรับ Debug

1. **เปิด Browser Developer Tools**
   ```
   - กด F12 หรือ Ctrl+Shift+I (Windows/Linux)
   - กด Cmd+Option+I (Mac)
   - ไปที่ tab "Console"
   ```

2. **ลองสร้าง Schedule ใหม่**
   - เข้า http://localhost:3001/schedules/create
   - กรอกข้อมูลในฟอร์ม
   - กด "Save Schedule"

3. **ตรวจสอบ Console Logs**
   ควรจะเห็น logs ตามลำดับนี้:
   ```
   💾 Form submitted with data: {...}
   🔍 Form Data Analysis: ...
   ✅ Form validation passed, proceeding with submission...
   💾 Creating schedule: {...}
   📅 Creating schedule (original): {...}
   🔍 Data extraction details: ...
   📦 Transformed payload for API: {...}
   ```

4. **ตรวจสอบ Network Tab**
   - ไปที่ tab "Network" 
   - ดูการเรียก POST `/api/admin/schedules`
   - ตรวจสอบ Request Payload และ Response

### ⚠️ Common Issues

#### Issue 1: DeviceId เป็น 0
```
❌ CRITICAL: No device selected! deviceId will be 0
```
**แก้ไข:** ต้องเลือก Target Device ใน tab "Target Devices"

#### Issue 2: Missing Time Slots
```
❌ CRITICAL: Missing time slot data!
```
**แก้ไข:** ต้องเพิ่ม Time Slot ใน tab "Time Slots"

#### Issue 3: No Content Selected
```
⚠️ WARNING: No media selected, schedule will be empty
```
**แก้ไข:** เลือก Media ใน tab "Content"

#### Issue 4: Authentication Error
```
401 Unauthorized
```
**แก้ไข:** ต้อง login ก่อนใช้งาน

### 📋 Debug Checklist

เมื่อมีปัญหา ให้ตรวจสอบตามลำดับ:

- [ ] ✅ **Basic Info Tab**: Name, Start Date, End Date กรอกครบ
- [ ] ✅ **Time Slots Tab**: มี Time Slot อย่างน้อย 1 รายการ
- [ ] ✅ **Target Devices Tab**: เลือก Device อย่างน้อย 1 ตัว  
- [ ] ✅ **Content Tab**: เลือก Media อย่างน้อย 1 รายการ (optional แต่แนะนำ)
- [ ] 🔐 **Authentication**: Login แล้ว และมี JWT token ที่ valid
- [ ] 🌐 **API Server**: Backend API รันอยู่ที่ http://localhost:5100
- [ ] 🖥️ **Frontend**: Frontend รันอยู่ที่ http://localhost:3001

### 📊 Sample Valid Payload

ตัวอย่างข้อมูลที่ถูกต้องที่ส่งไป API:
```json
{
  "name": "Test Schedule",
  "description": "Test Description", 
  "priority": 5,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "startTime": "08:00",
  "endTime": "17:00", 
  "deviceId": 1,
  "mediaIds": [1, 2, 3],
  "isRecurring": false,
  "recurrencePattern": null,
  "isDefault": false
}
```

### 🛠️ การแก้ไขปัญหา

1. **Clear Browser Cache**: Ctrl+Shift+Delete
2. **Restart Development Servers**: 
   - Frontend: `npm run dev` 
   - Backend: `dotnet run --project src/DigitalSignage.Api`
3. **Check Database**: ตรวจสอบว่า PostgreSQL ทำงานอยู่
4. **Verify JWT Token**: ใน localStorage หรือ cookies

### 📞 Support Information

หากยังมีปัญหา ให้ส่ง:
1. Console logs (screenshot หรือ copy text)
2. Network request details (Request + Response)
3. Steps ที่ทำก่อนเกิดปัญหา