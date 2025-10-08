# Device Registrations - เข้าถึงผ่าน Admin Dashboard

**วันที่:** 2025-10-08  
**ฟีเจอร์:** Device Registration Approval

## สถานะปัจจุบัน

มี API endpoint และหน้า Device Registrations อยู่แล้ว:
- **API:** `GET /api/admin/device-registration/pending`
- **หน้าเว็บ:** `/admin/device-registrations/pending`  
- **หน้า Admin Dashboard:** มี card "Device Registrations" ที่ลิงก์ไปหน้า pending (บรรทัด 269-277 ใน `admin/page.tsx`)

## การเข้าถึง

**ไม่ได้ใส่ใน Sidebar** เพราะมี card ใน Admin Dashboard อยู่แล้ว

### ไฟล์ที่เกี่ยวข้อง:

**`src/digital-signage-web/src/app/admin/page.tsx` (บรรทัด 269-277):**

```tsx
{/* Device Registrations */}
<AdminCard
  href="/admin/device-registrations/pending"
  icon={<Shield className="h-6 w-6 text-purple-600" />}
  title="Device Registrations"
  description="Review and approve pending device registrations"
  status="warning"
  count={5}
/>
```

**หมายเหตุ:** ไม่ได้เพิ่มใน Sidebar เพราะมี card ใน Dashboard อยู่แล้ว

## วิธีใช้งาน

### สำหรับ Admin:

1. **เข้าสู่ระบบ** ด้วยบัญชี Admin
2. **ไปที่ Admin Dashboard** (`/admin`)
3. **คลิก card "Device Registrations"** (ไอคอนโล่สีม่วง, มี badge แสดงจำนวน pending)
4. **เห็นรายการ pending registrations** พร้อม:
   - Device Name
   - MAC Address
   - PIN Code
   - Hardware Info
   - Registration Time

4. **Approve หรือ Reject** แต่ละ device:
   - กรอก Device Name, Location
   - เลือก Device Group (optional)
   - คลิก Approve/Reject

### การทดสอบ:

```bash
# 1. Register device ผ่าน API
curl -X 'POST' \
  'http://localhost:5100/api/device-registration/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "deviceName": "LG TV 55\"",
  "macAddress": "AA:BB:CC:DD:EE:02",
  "hardwareInfo": {
    "DisplayWidth": 3840,
    "DisplayHeight": 2160,
    "Manufacturer": "LG",
    "Model": "55UQ8000PSB"
  }
}'

# 2. ดูผลใน DeviceRegistrationRequests table
# 3. เปิดเว็บ → Login → ไปที่ /admin (Admin Dashboard)
# 4. คลิก card "Device Registrations"
# 5. เห็น pending request พร้อม approve
```

## Endpoint ที่เกี่ยวข้อง

### Backend API:
- `GET /api/admin/device-registration/pending` - ดูรายการ pending
- `POST /api/admin/device-registration/approve` - อนุมัติ device
- `POST /api/admin/device-registration/reject` - ปฏิเสธ device

### Frontend Routes:
- `/admin/device-registrations/pending` - หน้า approve devices
- `/admin` - Admin dashboard (มี card ลิงก์ไปหน้า pending)

## หมายเหตุ

- Card ใช้ไอคอน **Shield** (โล่) สีม่วง
- แสดง badge จำนวน pending registrations (ปัจจุบันตัวอย่างคือ 5)
- Status "warning" (สีเหลือง) เพื่อดึงดูดความสนใจว่ามี pending requests
- ต้อง login ด้วย role Admin เท่านั้น
- หน้า pending registrations มี real-time refresh ทุก 30 วินาที
- **ไม่ได้ใส่ใน Sidebar** เพราะ Admin Dashboard มี card ไว้แล้ว (หลีกเลี่ยงความซ้ำซ้อน)
