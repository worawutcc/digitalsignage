# TV Client Device API Reference
**คู่มือ API สำหรับอุปกรณ์ Android TV ในระบบ Digital Signage**

## 📋 สารบัญ (Table of Contents)

### 🔧 [การตั้งค่าเบื้องต้น (Getting Started)](#getting-started)
- [ภาพรวมระบบ (System Overview)](#system-overview)
- [สถาปัตยกรรม (Architecture)](#architecture)
- [ข้อกำหนดเบื้องต้น (Prerequisites)](#prerequisites)

### 📝 [การลงทะเบียนอุปกรณ์ (Device Registration)](#device-registration)
- [การลงทะเบียนแบบ Self-Registration](#device-registration-self-registration-via-qr-codepin)
- [การตรวจสอบสถานะการลงทะเบียน](#registration-status-check)
- [กรณีข้อผิดพลาดในการลงทะเบียน](#registration-error-cases)

### 💓 [การส่งสัญญาณชีพ (Device Heartbeat)](#device-heartbeat)
- [การส่ง Heartbeat แบบปกติ](#heartbeat-normal-operation)
- [การจัดการสถานะอุปกรณ์](#device-status-management)

### 📅 [การจัดการตารางเวลา (Schedule Management)](#schedule-management)
- [ดึงตารางเวลาถัดไป](#get-next-schedule-optimized-for-device-hardware)
- [ตรวจสอบการ Assignment](#get-current-assignment)

### 🔌 [SignalR Events (WebSocket)](#tv-client-signalr-events-websocket)
- [การเชื่อมต่อ WebSocket](#websocket-connection)
- [เหตุการณ์ต่างๆ](#signalr-events)
- [การจัดการ Connection](#connection-management)

### 🔐 [การยืนยันตัวตน (Authentication)](#authentication-การยืนยันตัวตน)

### 📊 [ตัวอย่างการใช้งาน (Implementation Examples)](#implementation-examples)

### 🧪 [การทดสอบ (Testing Guidelines)](#testing-guidelines)

### ❌ [การจัดการข้อผิดพลาด (Error Handling)](#error-handling)

---

## 🔧 Getting Started

### System Overview
ระบบ Digital Signage TV Client API เป็นระบบที่ออกแบบมาเพื่อให้อุปกรณ์ Android TV สามารถลงทะเบียนตัวเองและรับเนื้อหาที่เหมาะสมกับฮาร์ดแวร์ของตัวเองได้อย่างอัตโนมัติ

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android TV    │◄───│   Backend API   │◄───│  Admin Panel    │
│     Client      │    │   + SignalR     │    │   (Web UI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Register Device    │ 3. Admin Approval     │
         │ 2. Poll Status        │ 4. Real-time Events   │
         │ 5. Get Content        │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   AWS S3 CDN    │
                    │  (Media Files)  │
                    └─────────────────┘
```

### Prerequisites
- Android TV API Level 21+ (Android 5.0+)
- เชื่อมต่ออินเทอร์เน็ตที่เสถียร
- สิทธิ์ในการเข้าถึง Hardware Information
- การกำหนดค่า Network Security สำหรับ HTTPS/WebSocket

---

## 📝 Device Registration (Self-Registration via QR Code/PIN)
**การลงทะเบียนอุปกรณ์ TV แบบ Self-Registration ด้วย QR Code และ PIN**

### 📋 ขั้นตอนการลงทะเบียน (Registration Workflow)
```
1. TV Client เก็บข้อมูลฮาร์ดแวร์ → 2. ส่ง POST Request → 3. รับ PIN + Registration ID
                                                                    ↓
8. เริ่มใช้งานปกติ ← 7. ได้ Device Key ← 6. Admin อนุมัติ ← 5. แสดง QR Code ให้ Admin
                                                                    ↓
                                                           4. TV Polling สถานะ
```

### 🔧 การลงทะเบียนอุปกรณ์ใหม่

#### **POST `/api/device-registration/register`**
- **วัตถุประสงค์:** อุปกรณ์ TV ส่งข้อมูลลงทะเบียนพร้อมข้อมูล hardware เพื่อรับ PIN และ QR Code สำหรับให้ admin อนุมัติ
- **ความถี่ในการเรียก:** ใช้เพียงครั้งเดียวต่อการลงทะเบียนอุปกรณ์
- **Timeout:** 30 วินาที
- **Rate Limit:** 5 requests ต่อ MAC Address ต่อชั่วโมง
#### **📤 Request Body:**
```json
{
  "deviceName": "TV-Conference-Room-A",
  "macAddress": "AA:BB:CC:DD:EE:FF", 
  "email": "user@example.com",
  "hardwareInfo": {
    // ข้อมูลฮาร์ดแวร์หลัก (Required Fields)
    "displayWidth": 1920,
    "displayHeight": 1080,
    "manufacturer": "Samsung",
    "model": "QN65Q70AAFXZA",
    "androidVersion": "11.0",
    "apiLevel": 30,
    
    // ข้อมูลฮาร์ดแวร์เพิ่มเติม (Optional Fields)
    "refreshRate": 60.0,
    "physicalWidth": 55.0,
    "physicalHeight": 31.0,
    "densityDpi": 160,
    "buildFingerprint": "samsung/qn65q70aafxza/...",
    "supportedFormats": ["H264", "H265", "VP9"],
    "codecCapabilities": {
      "h264": {"maxWidth": 1920, "maxHeight": 1080, "maxFps": 60},
      "h265": {"maxWidth": 3840, "maxHeight": 2160, "maxFps": 30}
    },
    "additionalSpecs": {
      "storageTotal": "8GB",
      "storageAvailable": "5.2GB",
      "networkCapabilities": ["WiFi", "Ethernet"]
    }
  }
}
```

#### **📥 Success Response (201 Created):**
```json
{
  "id": 123,
  "deviceName": "TV-Conference-Room-A",
  "pin": "123456",
  "status": "Pending",
  "hasHardwareInfo": true,
  "hardwareDetectionJobId": 456,
  "createdAt": "2025-10-09T12:00:00Z",
  "message": "Enhanced registration successful",
  "qrCodeData": "https://admin.digitalsignage.com/approve?id=123&pin=123456"
}
```

#### **📝 รายละเอียดฟิลด์ Request:**

| ฟิลด์ | ประเภท | จำเป็น | คำอธิบาย |
|-------|---------|---------|----------|
| `deviceName` | string | ✅ | ชื่ออุปกรณ์ที่จะแสดงในระบบ (3-50 ตัวอักษร) |
| `macAddress` | string | ✅ | MAC Address รูปแบบ AA:BB:CC:DD:EE:FF (ต้องไม่ซ้ำในระบบ) |
| `email` | string | ✅ | อีเมลสำหรับสร้างบัญชีผู้ใช้อัตโนมัติ (format: email) |

#### **🔧 ข้อมูลฮาร์ดแวร์ (hardwareInfo):**

**ฟิลด์หลัก (Required):**
| ฟิลด์ | ประเภท | คำอธิบาย | ตัวอย่าง |
|-------|---------|----------|----------|
| `displayWidth` | integer | ความกว้างหน้าจอ (pixels) | 1920, 3840 |
| `displayHeight` | integer | ความสูงหน้าจอ (pixels) | 1080, 2160 |
| `manufacturer` | string | ผู้ผลิตอุปกรณ์ | "Samsung", "LG", "Sony" |
| `model` | string | รุ่นอุปกรณ์ | "QN65Q70AAFXZA" |
| `androidVersion` | string | เวอร์ชัน Android | "11.0", "12.0" |
| `apiLevel` | integer | Android API Level | 30, 31, 32 |

**ฟิลด์เพิ่มเติม (Optional):**
| ฟิลด์ | ประเภท | คำอธิบาย | ประโยชน์ |
|-------|---------|----------|----------|
| `refreshRate` | float | อัตรารีเฟรช (Hz) | การ optimize video playback |
| `physicalWidth` | float | ความกว้างจอจริง (นิ้ว) | คำนวณ DPI และ viewing distance |
| `densityDpi` | integer | DPI ของหน้าจอ | การ scale UI elements |
| `supportedFormats` | array | รูปแบบไฟล์ที่รองรับ | การเลือก media format |
| `codecCapabilities` | object | ความสามารถ codec | การ optimize encoding |

#### **📥 รายละเอียดฟิลด์ Response:**

| ฟิลด์ | ประเภท | คำอธิบาย |
|-------|---------|----------|
| `id` | integer | Registration ID สำหรับ polling สถานะ |
| `pin` | string | PIN 6 หลักสำหรับ admin อนุมัติ |
| `status` | string | สถานะปัจจุบัน: "Pending" |
| `hasHardwareInfo` | boolean | ระบบได้รับข้อมูลฮาร์ดแวร์แล้ว |
| `hardwareDetectionJobId` | integer | Job ID สำหรับ background processing |
| `qrCodeData` | string | URL สำหรับสร้าง QR Code |

### 🔍 Registration Status Check

#### **GET `/api/device-registration/{registrationId}/status`**
- **วัตถุประสงค์:** TV polling เพื่อตรวจสอบสถานะการอนุมัติและรับ deviceKey เมื่อได้รับการอนุมัติ
- **ความถี่ในการเรียก:** ทุก 5-10 วินาที จนกว่าจะได้สถานะ "Approved", "Rejected", หรือ "Expired"
- **Timeout:** 15 วินาที
- **Max Polling Duration:** 15 นาที

#### **📤 Request Parameters:**
| Parameter | ประเภท | คำอธิบาย |
|-----------|---------|----------|
| `registrationId` | integer | ID ที่ได้จากการ register (path parameter) |

#### **📥 Response Examples:**

**🔄 Pending (รอการอนุมัติ):**
```json
{
  "status": "Pending",
  "deviceKey": null,
  "deviceId": null,
  "message": "Waiting for admin approval",
  "hardwareOptimizationComplete": false,
  "registrationExpiry": "2025-10-09T12:15:00Z"
}
```

**✅ Approved (อนุมัติแล้ว):**
```json
{
  "status": "Approved",
  "deviceKey": "dev_abc123xyz789",
  "deviceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "message": "Device approved successfully",
  "hardwareOptimizationComplete": true,
  "deviceSettings": {
    "heartbeatInterval": 30,
    "contentRefreshInterval": 300,
    "maxRetryAttempts": 3
  }
}
```

**❌ Rejected (ปฏิเสธ):**
```json
{
  "status": "Rejected",
  "deviceKey": null,
  "deviceId": null,
  "message": "Device registration rejected by admin",
  "rejectionReason": "Unauthorized device in restricted area",
  "hardwareOptimizationComplete": false
}
```

**⏰ Expired (หมดอายุ):**
```json
{
  "status": "Expired",
  "deviceKey": null,
  "deviceId": null,
  "message": "Registration request has expired",
  "hardwareOptimizationComplete": false
}
```

#### **📝 สถานะต่างๆ และการดำเนินการ:**

| สถานะ | คำอธิบาย | การดำเนินการของ TV Client |
|-------|----------|---------------------------|
| **Pending** | รอ admin อนุมัติ | ♻️ ต่อ polling ทุก 5-10 วินาที |
| **Approved** | อนุมัติแล้ว | ✅ บันทึก deviceKey และเริ่มใช้งาน |
| **Rejected** | ปฏิเสธ | ❌ หยุด polling และแจ้งผู้ใช้ |
| **Expired** | หมดอายุ (15 นาที) | 🔄 สามารถลงทะเบียนใหม่ได้ |

### ⚠️ Registration Error Cases

#### **❌ Error Responses:**

**400 Bad Request - Invalid Data:**
```json
{
  "error": "ValidationError",
  "message": "Invalid device data provided",
  "details": {
    "macAddress": ["Invalid MAC address format"],
    "email": ["Invalid email format"],
    "hardwareInfo.displayWidth": ["Must be greater than 0"]
  },
  "statusCode": 400
}
```

**409 Conflict - Duplicate MAC Address:**
```json
{
  "error": "DuplicateDevice",
  "message": "Device with this MAC address already exists",
  "existingDeviceId": 456,
  "statusCode": 409
}
```

**429 Too Many Requests - Rate Limit:**
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many registration attempts",
  "retryAfter": 3600,
  "statusCode": 429
}
```

**500 Internal Server Error:**
```json
{
  "error": "InternalServerError",
  "message": "Registration service temporarily unavailable",
  "statusCode": 500
}
```

#### **🔧 Validation Rules:**

| ฟิลด์ | กฎการตรวจสอบ | ข้อความแสดงข้อผิดพลาด |
|-------|---------------|------------------------|
| `deviceName` | 3-50 ตัวอักษร, ไม่มีอักขระพิเศษ | "Device name must be 3-50 characters" |
| `macAddress` | รูปแบบ AA:BB:CC:DD:EE:FF, ไม่ซ้ำ | "Invalid MAC address format" |
| `email` | รูปแบบ email ที่ถูกต้อง | "Invalid email format" |
| `displayWidth` | เลขจำนวนเต็ม > 0 | "Display width must be greater than 0" |
| `displayHeight` | เลขจำนวนเต็ม > 0 | "Display height must be greater than 0" |
| `apiLevel` | เลขจำนวนเต็ม >= 21 | "Minimum API level is 21" |

---

## �‍💼 Admin Approval APIs
**API สำหรับ Admin อนุมัติ/ปฏิเสธอุปกรณ์**

### 📋 ภาพรวม Admin Approval Methods

Admin สามารถอนุมัติอุปกรณ์ได้ 2 วิธี:

#### **1. 📱 QR Code/PIN Method (สำหรับ Mobile Admin)**
- Admin scan QR Code หรือใส่ PIN บนมือถือ
- ต้องใส่ PIN เพื่อยืนยันตัวตน
- ใช้เมื่อ admin อยู่ใกล้ TV

#### **2. 💻 Manual Dashboard Method (สำหรับ Web Admin)**
- Admin อนุมัติผ่าน Web Dashboard
- **ไม่ต้องใส่ PIN** (เพราะ admin login แล้ว)
- ใช้เมื่อ admin อยู่ที่โต๊ะทำงาน

### 🔧 Admin Approval Endpoints

#### **POST `/api/admin/device-registration/approve`**
**สำหรับ Admin อนุมัติผ่าน Web Dashboard (ไม่ต้องใส่ PIN)**

- **วัตถุประสงค์:** Admin อนุมัติอุปกรณ์ผ่าน Dashboard โดยไม่ต้องใส่ PIN
- **Authentication:** Bearer Token (Admin JWT)
- **Rate Limit:** 100 requests ต่อ admin ต่อนาที

#### **📤 Request Body:**
```json
{
  "registrationId": 123,
  "reason": "Approved for conference room usage"
}
```

#### **📥 Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Device approved successfully",
  "deviceId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "deviceKey": "dev_abc123xyz789",
  "approvedBy": "admin@company.com",
  "approvedAt": "2025-10-09T12:00:00Z"
}
```

#### **POST `/api/admin/device-registration/reject`**
**สำหรับ Admin ปฏิเสธผ่าน Web Dashboard (ไม่ต้องใส่ PIN)**

#### **📤 Request Body:**
```json
{
  "registrationId": 123,
  "reason": "Unauthorized device in restricted area"
}
```

#### **📥 Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Device registration rejected",
  "rejectedBy": "admin@company.com",
  "rejectedAt": "2025-10-09T12:00:00Z",
  "reason": "Unauthorized device in restricted area"
}
```

---

### 📱 QR Code/PIN Approval Endpoints

#### **POST `/api/device-registration/approve-by-pin`**
**สำหรับ Admin ใส่ PIN (Mobile/QR Code Method)**

- **วัตถุประสงค์:** Admin ใส่ PIN เพื่ออนุมัติ (ใช้เมื่อ scan QR Code หรือใส่ PIN manual)
- **Authentication:** PIN-based (ไม่ต้อง JWT)

#### **📤 Request Body:**
```json
{
  "registrationId": 123,
  "pin": "123456",
  "adminEmail": "admin@company.com"
}
```

#### **POST `/api/device-registration/reject-by-pin`**
**สำหรับ Admin ใส่ PIN เพื่อปฏิเสธ**

#### **📤 Request Body:**
```json
{
  "registrationId": 123,
  "pin": "123456",
  "adminEmail": "admin@company.com",
  "reason": "Security concern"
}
```

---

### ❌ Admin API Error Cases

#### **400 Bad Request - Missing PIN (สำหรับ PIN Method เท่านั้น):**
```json
{
  "error": "ValidationError",
  "message": "PIN is required for PIN-based approval",
  "details": {
    "Pin": ["The field Pin must be a string with a minimum length of 6 and a maximum length of 6."]
  },
  "statusCode": 400
}
```

#### **401 Unauthorized - Invalid JWT (สำหรับ Dashboard Method):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired admin token",
  "statusCode": 401
}
```

#### **403 Forbidden - Invalid PIN (สำหรับ PIN Method):**
```json
{
  "error": "InvalidPin",
  "message": "PIN is incorrect or expired",
  "statusCode": 403
}
```

#### **404 Not Found - Registration Not Found:**
```json
{
  "error": "RegistrationNotFound",
  "message": "Registration request not found or already processed",
  "statusCode": 404
}
```

### 📊 API Usage Summary

| Method | Endpoint | Authentication | PIN Required | Use Case |
|--------|----------|----------------|--------------|----------|
| **Dashboard Approval** | `/api/admin/device-registration/approve` | JWT Bearer Token | ❌ No | Web admin panel |
| **Dashboard Rejection** | `/api/admin/device-registration/reject` | JWT Bearer Token | ❌ No | Web admin panel |
| **PIN Approval** | `/api/device-registration/approve-by-pin` | PIN-based | ✅ Yes | Mobile/QR scan |
| **PIN Rejection** | `/api/device-registration/reject-by-pin` | PIN-based | ✅ Yes | Mobile/QR scan |

### 🔄 Updated Registration Flow

```
1. TV ลงทะเบียน → 2. รับ PIN + Registration ID → 3. แสดง QR Code + PIN
                                                                    ↓
                                            4a. Admin Scan QR (ใส่ PIN) ┌──────────────┐
                                                        │                  │              │
                                            4b. Admin ใส่ PIN Manual ────→│  PIN Method  │
                                                        │                  │              │
                                            4c. Admin อนุมัติผ่าน Dashboard │ (ใส่ PIN)    │
                                                        │                  └─────┬────────┘
                                                        ↓                        │
                                            ┌──────────────┐                     │
                                            │   Dashboard  │                     │
                                            │    Method    │                     │
                                            │ (ไม่ต้องใส่ PIN) │◄────────────────────┘
                                            └─────┬────────┘
                                                  │
                                                  ↓
                                            5. Device ได้ deviceKey
```

---

## �💓 Device Heartbeat
**การส่งสัญญาณชีพของอุปกรณ์**

### 📋 ภาพรวม Heartbeat System
การส่ง Heartbeat เป็นกลไกสำคัญที่ช่วยให้ระบบติดตามสถานะอุปกรณ์แบบ real-time และตรวจจับปัญหาการเชื่อมต่อได้อย่างรวดเร็ว

### 🔄 Heartbeat Normal Operation

#### **POST `/api/device/heartbeat`**
- **วัตถุประสงค์:** TV ส่งสัญญาณแจ้งสถานะการทำงานเป็นระยะๆ เพื่อให้ระบบทราบว่าอุปกรณ์ยังใช้งานได้
- **ความถี่:** ทุก 30 วินาที (ตั้งค่าได้จาก deviceSettings)
- **Timeout:** 10 วินาที
- **Retry Policy:** 3 ครั้ง ด้วย exponential backoff (1s, 2s, 4s)

#### **📤 Request:**
```json
{
  "deviceKey": "dev_abc123xyz789",
  "timestamp": "2025-10-09T12:00:00Z",
  "status": "Online",
  "systemInfo": {
    "cpuUsage": 25.5,
    "memoryUsage": 60.2,
    "storageUsage": 45.8,
    "temperature": 42.3,
    "networkStrength": 85,
    "lastContentUpdate": "2025-10-09T11:30:00Z"
  },
  "currentPlayback": {
    "scheduleId": 123,
    "mediaId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "playbackPosition": 15.5,
    "duration": 30.0
  }
}
```

#### **📥 Success Response (200 OK):**
```json
{
  "message": "Heartbeat processed successfully",
  "serverTime": "2025-10-09T12:00:01Z",
  "nextHeartbeatInterval": 30,
  "instructions": {
    "shouldRefreshContent": false,
    "shouldReconnectWebSocket": false,
    "configurationChanged": false
  }
}
```

#### **📝 รายละเอียดฟิลด์:**

**ฟิลด์หลัก:**
| ฟิลด์ | ประเภท | จำเป็น | คำอธิบาย |
|-------|---------|---------|----------|
| `deviceKey` | string | ✅ | คีย์อุปกรณ์ที่ได้จากการลงทะเบียน |
| `timestamp` | string | ✅ | เวลาปัจจุบัน (ISO 8601 UTC) |
| `status` | string | ✅ | สถานะ: "Online", "Offline", "Error", "Maintenance" |

**ข้อมูลระบบ (systemInfo - Optional):**
| ฟิลด์ | ประเภท | คำอธิบาย | หน่วย |
|-------|---------|----------|-------|
| `cpuUsage` | float | การใช้งาน CPU | เปอร์เซ็นต์ (0-100) |
| `memoryUsage` | float | การใช้งาน RAM | เปอร์เซ็นต์ (0-100) |
| `storageUsage` | float | การใช้งาน Storage | เปอร์เซ็นต์ (0-100) |
| `temperature` | float | อุณหภูมิอุปกรณ์ | องศาเซลเซียส |
| `networkStrength` | integer | ความแรงสัญญาณ | เปอร์เซ็นต์ (0-100) |

#### **🚨 Device Status Management:**

| สถานะ | คำอธิบาย | การดำเนินการของระบบ |
|-------|----------|----------------------|
| **Online** | ทำงานปกติ | ✅ ไม่มีการแจ้งเตือน |
| **Offline** | ไม่สามารถเชื่อมต่อได้ | ⚠️ แจ้งเตือน admin หลัง 2 นาที |
| **Error** | เกิดข้อผิดพลาด | 🚨 แจ้งเตือนทันที + ส่ง error logs |
| **Maintenance** | อยู่ระหว่างบำรุงรักษา | 🔧 ไม่แจ้งเตือน, บันทึก maintenance log |

#### **❌ Heartbeat Error Responses:**

**401 Unauthorized - Invalid Device Key:**
```json
{
  "error": "InvalidDeviceKey",
  "message": "Device key is invalid or expired",
  "statusCode": 401
}
```

**404 Not Found - Device Not Found:**
```json
{
  "error": "DeviceNotFound",
  "message": "Device not found in system",
  "statusCode": 404
}
```

---

## 📅 Schedule Management

### 📋 ภาพรวมระบบตารางเวลา
ระบบตารางเวลาได้รับการออกแบบมาเพื่อให้อุปกรณ์ได้รับเนื้อหาที่เหมาะสมกับฮาร์ดแวร์และการ assignment ของผู้ใช้แบบอัตโนมัติ

### 🎯 Get Next Schedule (Optimized for Device Hardware)
**ดึงตารางเวลาถัดไปที่เหมาะสมกับฮาร์ดแวร์ของอุปกรณ์**

#### **GET `/api/device/next-schedule`**
- **วัตถุประสงค์:** TV ดึงตารางเวลาและไฟล์สื่อที่ถูก optimize ตามความสามารถของฮาร์ดแวร์และการ assign ผู้ใช้
- **ความถี่:** ตามที่กำหนดใน contentRefreshInterval (ค่าเริ่มต้น 5 นาที)
- **Timeout:** 30 วินาที
- **Cache:** Response จะถูก cache 1 นาที

#### **📤 Request Headers:**
```
Authorization: DeviceKey dev_abc123xyz789
Accept: application/json
User-Agent: AndroidTV-Client/1.0
```

#### **📤 Query Parameters (Optional):**
| Parameter | ประเภท | คำอธิบาย |
|-----------|---------|----------|
| `includeNext` | boolean | รวมตารางเวลาถัดไป (default: false) |
| `includeFallback` | boolean | รวมเนื้อหาสำรอง (default: true) |
| `optimizeFor` | string | optimize สำหรับ: "performance", "quality", "bandwidth" |
#### **📥 Success Response (200 OK):**
```json
{
  "scheduleId": 123,
  "name": "Morning Announcements",
  "description": "Daily morning announcements for employees",
  "startTime": "2025-10-09T09:00:00Z",
  "endTime": "2025-10-09T18:00:00Z",
  "priority": "High",
  "assignmentType": "User",
  "assignedUserId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "assignedUserName": "John Doe",
  "isActive": true,
  "media": [
    {
      "mediaId": "m47ac10b-58cc-4372-a567-0e02b2c3d480",
      "type": "Video",
      "filename": "announcement.mp4",
      "presignedUrl": "https://s3.amazonaws.com/bucket/media/announcement.mp4?X-Amz-Expires=3600&X-Amz-Signature=...",
      "duration": 30,
      "resolution": "1920x1080",
      "fileSize": 15728640,
      "optimizedForDevice": true,
      "optimizationInfo": {
        "codec": "H264",
        "bitrate": "2000k",
        "framerate": 30,
        "hardwareAccelerated": true
      },
      "order": 1
    },
    {
      "mediaId": "m47ac10b-58cc-4372-a567-0e02b2c3d481",
      "type": "Image",
      "filename": "welcome-slide.jpg",
      "presignedUrl": "https://s3.amazonaws.com/bucket/media/welcome-slide.jpg?X-Amz-Expires=3600&X-Amz-Signature=...",
      "duration": 10,
      "resolution": "1920x1080",
      "fileSize": 2048576,
      "optimizedForDevice": true,
      "order": 2
    }
  ],
  "fallbackMedia": [
    {
      "mediaId": "default-001",
      "type": "Image",
      "filename": "default-screen.jpg",
      "presignedUrl": "https://s3.amazonaws.com/bucket/fallback/default-screen.jpg?X-Amz-Expires=86400&X-Amz-Signature=...",
      "duration": 60,
      "resolution": "1920x1080"
    }
  ],
  "playbackSettings": {
    "loop": true,
    "shuffleOrder": false,
    "transitionEffect": "fade",
    "transitionDuration": 1.0
  },
  "nextSchedule": {
    "scheduleId": 124,
    "name": "Afternoon Updates",
    "startTime": "2025-10-09T18:00:00Z",
    "preloadRecommended": true
  },
  "serverTime": "2025-10-09T12:00:00Z",
  "cacheExpiry": "2025-10-09T12:01:00Z"
}
```

#### **📥 No Content Response (204 No Content):**
```json
{
  "message": "No active schedule found for this device",
  "fallbackMedia": [
    {
      "mediaId": "default-001",
      "type": "Image",
      "presignedUrl": "https://s3.amazonaws.com/bucket/fallback/default-screen.jpg?X-Amz-Expires=86400&X-Amz-Signature=..."
    }
  ],
  "checkAgainAt": "2025-10-09T13:00:00Z"
}
```

#### **📝 รายละเอียดฟิลด์ Response:**

**ฟิลด์หลัก:**
| ฟิลด์ | ประเภท | คำอธิบาย |
|-------|---------|----------|
| `scheduleId` | integer | รหัสตารางเวลาที่ไม่ซ้ำ |
| `name` | string | ชื่อตารางเวลา |
| `assignmentType` | string | "User", "Group", "Default" |
| `isActive` | boolean | ตารางเวลาใช้งานอยู่หรือไม่ |

**ข้อมูลสื่อ (media):**
| ฟิลด์ | ประเภท | คำอธิบาย |
|-------|---------|----------|
| `type` | string | "Image", "Video", "HTML", "Audio" |
| `presignedUrl` | string | URL สำหรับดาวน์โหลด (หมดอายุตามที่กำหนด) |
| `optimizedForDevice` | boolean | สื่อถูก optimize สำหรับอุปกรณ์นี้แล้ว |
| `order` | integer | ลำดับการเล่น |

**การตั้งค่าการเล่น (playbackSettings):**
| ฟิลด์ | ประเภท | คำอธิบาย |
|-------|---------|----------|
| `loop` | boolean | เล่นซ้ำหรือไม่ |
| `shuffleOrder` | boolean | สุ่มลำดับการเล่น |
| `transitionEffect` | string | เอฟเฟคการเปลี่ยน: "fade", "slide", "none" |

## Get Current Assignment
**ตรวจสอบการ assign ผู้ใช้/กลุ่มปัจจุบัน**

- **GET `/api/device/current-assignment`**
  - **วัตถุประสงค์:** TV ตรวจสอบว่าตัวเองถูก assign ให้กับผู้ใช้หรือกลุ่มไหน เพื่อแสดงเนื้อหาที่เหมาะสม
  - **Headers:**
    `Authorization: DeviceKey {deviceKey}`
  - **Response:**
    ```json
    {
      "deviceId": "guid",
      "assignedUserId": "guid",
      "groupId": "guid",
      "assignmentType": "User|Group|Default"
    }
    ```
  - **คำอธิบาย Response:**
    - `assignmentType`: ประเภทการ assign ปัจจุบัน
    - `assignedUserId`: รหัสผู้ใช้ที่ถูก assign (ถ้ามี)
    - `groupId`: รหัสกลุ่มที่อุปกรณ์สังกัด (ถ้ามี)

---

---

## 🔌 TV Client SignalR Events (WebSocket)
**เหตุการณ์แบบ Real-time ผ่าน WebSocket**

### 🌐 WebSocket Connection

#### **Connection Details:**
- **URL:** `ws://api.digitalsignage.com/ws` (Production)
- **Development:** `ws://localhost:5100/ws`
- **Protocol:** SignalR over WebSocket
- **Auto Reconnect:** เปิดใช้งาน (exponential backoff)
- **Heartbeat:** ทุก 30 วินาที

#### **🔐 Authentication:**
```javascript
// การเชื่อมต่อพร้อม Device Key
const connection = new signalR.HubConnectionBuilder()
    .withUrl("ws://api.digitalsignage.com/ws", {
        accessTokenFactory: () => "dev_abc123xyz789"
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .build();
```

#### **📡 Connection States:**
| สถานะ | คำอธิบาย | การดำเนินการ |
|-------|----------|--------------|
| **Connecting** | กำลังเชื่อมต่อ | แสดง loading indicator |
| **Connected** | เชื่อมต่อสำเร็จ | เริ่มรับ events |
| **Reconnecting** | กำลังเชื่อมต่อใหม่ | แสดงสถานะ offline |
| **Disconnected** | ตัดการเชื่อมต่อ | พยายามเชื่อมต่อใหม่ |

### 🔔 SignalR Events

### 1. DeviceContentUpdate (อัปเดตเนื้อหาอุปกรณ์)
- **Event Name:** `DeviceContentUpdate`
- **Purpose:** แจ้งเตือน TV ให้รีเฟรชเนื้อหาทันทีเมื่อมีการเปลี่ยนแปลง schedule หรือ media
- **Payload:**
  ```json
  {
    "deviceId": 123,
    "scheduleId": 456,
    "scheduleChanged": true,
    "userAssignmentChanged": false,
    "mediaIds": [100, 101, 102],
    "timestamp": "2025-10-08T12:00:00Z"
  }
  ```
- **Field Descriptions:**
  - `deviceId` (int): รหัสอุปกรณ์
  - `scheduleId` (int): รหัสตารางเวลาใหม่
  - `scheduleChanged` (bool): ตารางเวลามีการเปลี่ยนแปลง (เช่น เวลา, วันที่)
  - `userAssignmentChanged` (bool): การ assign ผู้ใช้มีการเปลี่ยนแปลง
  - `mediaIds` (int[]): รายการ media IDs ที่อยู่ในตารางเวลา
  - `timestamp` (string): เวลาที่เกิดเหตุการณ์ (ISO 8601 UTC)
- **Triggered By:** เมื่อมีการเปลี่ยนแปลงตารางเวลา, เพิ่ม/ลบสื่อในตารางเวลา, หรือเปลี่ยน user/group assignment
- **Device Action:** ดึงข้อมูล schedule ใหม่จาก `/api/device/next-schedule` และอัปเดตการแสดงผล

### 2. DeviceAssignmentChanged (เปลี่ยนแปลงการ assign อุปกรณ์)
- **Event Name:** `DeviceAssignmentChanged`
- **Purpose:** แจ้งเตือนการเปลี่ยนแปลงการ assign ผู้ใช้/กลุ่มเพื่อให้ TV แสดงเนื้อหาที่เหมาะสม
- **Payload:**
  ```json
  {
    "deviceId": 123,
    "previousUserId": 42,
    "newUserId": 50,
    "assignmentType": "User",
    "groupId": null,
    "requiresContentRefresh": true,
    "timestamp": "2025-10-08T12:00:00Z"
  }
  ```
- **Field Descriptions:**
  - `deviceId` (int): รหัสอุปกรณ์
  - `previousUserId` (int?): รหัสผู้ใช้เดิม (null ถ้าไม่มี)
  - `newUserId` (int?): รหัสผู้ใช้ใหม่ (null ถ้าถูกยกเลิก)
  - `assignmentType` (string): ประเภทการ assign (User, Group, Default)
  - `groupId` (int?): รหัสกลุ่มถ้า assign แบบ Group
  - `requiresContentRefresh` (bool): ต้องรีเฟรชเนื้อหาหรือไม่
  - `timestamp` (string): เวลาที่เกิดเหตุการณ์
- **Triggered By:** เมื่อ admin เปลี่ยน user assignment, device group, หรือ unassign อุปกรณ์
- **Device Action:** ตรวจสอบ assignment ปัจจุบันผ่าน `/api/device/current-assignment` และดึงเนื้อหาใหม่

### 3. DeviceStatusAlert (แจ้งเตือนสถานะอุปกรณ์)
- **Event Name:** `DeviceStatusAlert`
- **Purpose:** แจ้งเตือนสถานะและปัญหาของอุปกรณ์แบบ real-time
- **Payload:**
  ```json
  {
    "deviceId": 123,
    "status": "Error",
    "severity": "Warning",
    "message": "Device disconnected unexpectedly",
    "timestamp": "2025-10-08T12:00:00Z"
  }
  ```
- **Field Descriptions:**
  - `deviceId` (int): รหัสอุปกรณ์
  - `status` (string): สถานะอุปกรณ์ (Online, Offline, Error, Maintenance)
  - `severity` (string): ระดับความรุนแรง (Info, Warning, Error, Critical)
  - `message` (string): ข้อความแจ้งเตือน
  - `timestamp` (string): เวลาที่เกิดเหตุการณ์
- **Triggered By:** เมื่อตรวจพบปัญหาการเชื่อมต่อ, ข้อผิดพลาดระบบ, หรือการบำรุงรักษา
- **Device Action:** แสดงข้อความแจ้งเตือนหรือ log ข้อความสำหรับการตรวจสอบ

### 4. HardwareOptimizationComplete (การ optimize ฮาร์ดแวร์เสร็จสิ้น)
- **Event Name:** `HardwareOptimizationComplete`
- **Purpose:** แจ้งเตือนเมื่อการวิเคราะห์และ optimize ฮาร์ดแวร์เสร็จสิ้นแล้ว
- **Payload:**
  ```json
  {
    "deviceId": 123,
    "jobId": 456,
    "optimizedFormats": ["H264", "H265", "VP9"],
    "recommendedResolution": "1920x1080",
    "contentNeedsRefresh": true,
    "timestamp": "2025-10-08T12:00:00Z"
  }
  ```
- **Field Descriptions:**
  - `deviceId` (int): รหัสอุปกรณ์
  - `jobId` (int): รหัส hardware detection job
  - `optimizedFormats` (string[]): รายการรูปแบบสื่อที่ optimize แล้ว
  - `recommendedResolution` (string): ความละเอียดที่แนะนำสำหรับอุปกรณ์
  - `contentNeedsRefresh` (bool): ต้องดึงเนื้อหาใหม่หรือไม่
  - `timestamp` (string): เวลาที่เกิดเหตุการณ์
- **Triggered By:** หลังจากลงทะเบียนและ background service วิเคราะห์ความสามารถของฮาร์ดแวร์เสร็จ
- **Device Action:** ดึงเนื้อหาที่ optimize แล้วจาก `/api/device/next-schedule` เพื่อรับ media ที่เหมาะสมกับฮาร์ดแวร์

---

## SignalR Events Summary (สรุป Events ทั้งหมด)

| Event Name | Purpose | When Triggered | Device Action Required |
|------------|---------|----------------|----------------------|
| `DeviceContentUpdate` | อัปเดตเนื้อหา | เปลี่ยน schedule/media | ดึง next-schedule ใหม่ |
| `DeviceAssignmentChanged` | เปลี่ยน assignment | Admin เปลี่ยน user/group | ตรวจสอบ current-assignment |
| `DeviceStatusAlert` | แจ้งเตือนสถานะ | เกิดปัญหาหรือการแจ้งเตือน | แสดงข้อความหรือ log |
| `HardwareOptimizationComplete` | Optimize เสร็จ | วิเคราะห์ฮาร์ดแวร์เสร็จ | ดึงเนื้อหาที่ optimize แล้ว |

**หมายเหตุ:**
- ทุก event จะถูกส่งไปที่ device โดยตรง (group `device:{deviceId}`) และไปยัง admin (group `device:all`)
- ทุก payload จะมี `timestamp` เป็น ISO 8601 UTC format
- Device ควร handle events แบบ asynchronous และ log ทุก event สำหรับการตรวจสอบ

### 🔧 Connection Management

#### **Connection Lifecycle:**
```javascript
// การจัดการ connection states
connection.onclose((error) => {
    console.log(`Connection closed: ${error}`);
    // แสดง offline indicator
    showOfflineIndicator();
});

connection.onreconnecting((error) => {
    console.log(`Reconnecting: ${error}`);
    // แสดง reconnecting indicator
    showReconnectingIndicator();
});

connection.onreconnected((connectionId) => {
    console.log(`Reconnected: ${connectionId}`);
    // ซ่อน offline indicators
    hideConnectionIndicators();
    // ส่ง heartbeat ทันที
    sendHeartbeat();
});
```

#### **Event Handlers Registration:**
```javascript
// ลงทะเบียน event handlers
connection.on("DeviceContentUpdate", handleContentUpdate);
connection.on("DeviceAssignmentChanged", handleAssignmentChanged);
connection.on("DeviceStatusAlert", handleStatusAlert);
connection.on("HardwareOptimizationComplete", handleOptimizationComplete);
```

---

## 🔐 Authentication (การยืนยันตัวตน)

### 📋 Authentication Methods

#### **1. API Calls Authentication:**
```http
# Method 1: Authorization Header (Recommended)
Authorization: DeviceKey dev_abc123xyz789

# Method 2: X-Device-Key Header (Alternative)
X-Device-Key: dev_abc123xyz789
```

#### **2. WebSocket Authentication:**
```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("ws://api.digitalsignage.com/ws", {
        headers: {
            "Authorization": "DeviceKey dev_abc123xyz789"
        }
    })
    .build();
```

#### **3. Device Key Management:**
```javascript
// เก็บ device key อย่างปลอดภัย
class DeviceKeyManager {
    static setDeviceKey(key) {
        // ใช้ encrypted storage
        localStorage.setItem('device_key_encrypted', encrypt(key));
    }
    
    static getDeviceKey() {
        const encrypted = localStorage.getItem('device_key_encrypted');
        return encrypted ? decrypt(encrypted) : null;
    }
    
    static clearDeviceKey() {
        localStorage.removeItem('device_key_encrypted');
    }
}
```

---

## 📊 Implementation Examples

### 🤖 Android/Kotlin Implementation

#### **1. Device Registration:**
```kotlin
class DeviceRegistrationService {
    private val api = DigitalSignageApi()
    
    suspend fun registerDevice(): Result<RegistrationResponse> {
        val hardwareInfo = getHardwareInfo()
        val request = DeviceRegistrationRequest(
            deviceName = getDeviceName(),
            macAddress = getMacAddress(),
            email = getUserEmail(),
            hardwareInfo = hardwareInfo
        )
        
        return try {
            val response = api.registerDevice(request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun getHardwareInfo(): HardwareInfo {
        val displayMetrics = getDisplayMetrics()
        return HardwareInfo(
            displayWidth = displayMetrics.widthPixels,
            displayHeight = displayMetrics.heightPixels,
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            androidVersion = Build.VERSION.RELEASE,
            apiLevel = Build.VERSION.SDK_INT,
            refreshRate = getRefreshRate(),
            densityDpi = displayMetrics.densityDpi
        )
    }
}
```

#### **2. Heartbeat Service:**
```kotlin
class HeartbeatService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var heartbeatRunnable: Runnable? = null
    private val api = DigitalSignageApi()
    
    fun startHeartbeat(intervalSeconds: Int = 30) {
        heartbeatRunnable = object : Runnable {
            override fun run() {
                sendHeartbeat()
                handler.postDelayed(this, intervalSeconds * 1000L)
            }
        }
        handler.post(heartbeatRunnable!!)
    }
    
    private suspend fun sendHeartbeat() {
        val systemInfo = SystemInfo(
            cpuUsage = getCpuUsage(),
            memoryUsage = getMemoryUsage(),
            storageUsage = getStorageUsage(),
            temperature = getDeviceTemperature(),
            networkStrength = getNetworkStrength()
        )
        
        val request = HeartbeatRequest(
            deviceKey = DeviceKeyManager.getDeviceKey(),
            timestamp = Instant.now().toString(),
            status = "Online",
            systemInfo = systemInfo
        )
        
        try {
            api.sendHeartbeat(request)
        } catch (e: Exception) {
            Log.e("Heartbeat", "Failed to send heartbeat", e)
        }
    }
}
```

#### **3. Content Management:**
```kotlin
class ContentManager {
    private val api = DigitalSignageApi()
    private var currentSchedule: Schedule? = null
    
    suspend fun refreshContent() {
        try {
            val schedule = api.getNextSchedule()
            if (schedule != currentSchedule) {
                currentSchedule = schedule
                loadAndDisplayContent(schedule)
            }
        } catch (e: Exception) {
            displayFallbackContent()
        }
    }
    
    private suspend fun loadAndDisplayContent(schedule: Schedule) {
        val mediaItems = schedule.media.map { mediaInfo ->
            downloadMedia(mediaInfo.presignedUrl, mediaInfo.filename)
        }
        
        playlistManager.setPlaylist(mediaItems, schedule.playbackSettings)
    }
    
    private suspend fun downloadMedia(url: String, filename: String): MediaItem {
        // ดาวน์โหลดไฟล์และ cache ในเครื่อง
        val localFile = cacheManager.downloadAndCache(url, filename)
        return MediaItem(localFile.path, getMediaType(filename))
    }
}
```

### 🌐 JavaScript/Web Implementation

#### **1. Registration Status Polling:**
```javascript
class RegistrationPoller {
    constructor(registrationId) {
        this.registrationId = registrationId;
        this.pollInterval = null;
        this.maxPollDuration = 15 * 60 * 1000; // 15 minutes
        this.pollFrequency = 5000; // 5 seconds
    }
    
    startPolling() {
        const startTime = Date.now();
        
        this.pollInterval = setInterval(async () => {
            if (Date.now() - startTime > this.maxPollDuration) {
                this.stopPolling();
                this.onExpired();
                return;
            }
            
            try {
                const status = await this.checkStatus();
                
                switch (status.status) {
                    case 'Approved':
                        this.stopPolling();
                        this.onApproved(status.deviceKey, status.deviceId);
                        break;
                    case 'Rejected':
                        this.stopPolling();
                        this.onRejected(status.message);
                        break;
                    case 'Expired':
                        this.stopPolling();
                        this.onExpired();
                        break;
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, this.pollFrequency);
    }
    
    async checkStatus() {
        const response = await fetch(
            `/api/device-registration/${this.registrationId}/status`
        );
        return await response.json();
    }
    
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}
```

#### **2. SignalR Event Handling:**
```javascript
class SignalRManager {
    constructor(deviceKey) {
        this.deviceKey = deviceKey;
        this.connection = null;
        this.eventHandlers = new Map();
    }
    
    async connect() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/ws", {
                accessTokenFactory: () => this.deviceKey
            })
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .build();
        
        this.registerEventHandlers();
        await this.connection.start();
    }
    
    registerEventHandlers() {
        this.connection.on("DeviceContentUpdate", (data) => {
            this.handleContentUpdate(data);
        });
        
        this.connection.on("DeviceAssignmentChanged", (data) => {
            this.handleAssignmentChanged(data);
        });
        
        this.connection.on("DeviceStatusAlert", (data) => {
            this.handleStatusAlert(data);
        });
    }
    
    async handleContentUpdate(data) {
        console.log('Content update received:', data);
        
        if (data.scheduleChanged) {
            // ดึงตารางเวลาใหม่
            await contentManager.refreshSchedule();
        }
        
        if (data.userAssignmentChanged) {
            // ตรวจสอบ assignment ใหม่
            await assignmentManager.checkAssignment();
        }
    }
}
```

## Registration Flow Summary (สรุปขั้นตอนการลงทะเบียน)
1. **TV เริ่มลงทะเบียน** โดยเรียก `/register` พร้อมข้อมูลอุปกรณ์และฮาร์ดแวร์ครบถ้วน

2. **TV แสดง QR code** พร้อม PIN สำหรับให้ admin สแกน

3. **Admin สแกน QR code** และอนุมัติผ่าน dashboard

4. **TV polling** `/status/{registrationId}` จนได้รับการอนุมัติและได้ deviceKey

5. **TV เริ่มใช้งาน** ส่ง heartbeat, sync เนื้อหา, และเชื่อมต่อ WebSocket พร้อมรับเนื้อหาที่ optimize แล้ว

## Hardware Information Benefits (ประโยชน์ของข้อมูลฮาร์ดแวร์)
- **Content Optimization (การ Optimize เนื้อหา):** ระบบส่งไฟล์สื่อที่เหมาะสมกับสเปคของอุปกรณ์
- **Quality Selection (การเลือกคุณภาพ):** เลือกความละเอียดและรูปแบบไฟล์อัตโนมัติตามความสามารถของจอแสดงผล  
- **Performance Monitoring (การติดตามประสิทธิภาพ):** เก็บข้อมูลสุขภาพอุปกรณ์แบบละเอียด
- **Codec Support (การรองรับ Codec):** เข้ารหัสสื่อแบบที่เหมาะสมตามการเร่งความเร็วด้วยฮาร์ดแวร์

## Polling vs. WebSocket (การ Polling เทียบกับ WebSocket)
- **การลงทะเบียน:** TV ควร polling สถานะจนได้รับการอนุมัติ
- **การเปลี่ยนแปลงเนื้อหา/assignment/สถานะ:** ใช้ SignalR events เพื่อรับข้อมูลแบบ real-time
- **ผลลัพธ์การ optimize ฮาร์ดแวร์:** จะส่งผ่าน WebSocket events

---

## 🧪 Testing Guidelines

### 📋 การทดสอบ API Endpoints

#### **1. Registration Testing:**
```bash
# ทดสอบการลงทะเบียนอุปกรณ์
curl -X POST https://api.digitalsignage.com/api/device-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "Test-TV-001",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "email": "test@example.com",
    "hardwareInfo": {
      "displayWidth": 1920,
      "displayHeight": 1080,
      "manufacturer": "Samsung",
      "model": "Test-Model",
      "androidVersion": "11.0",
      "apiLevel": 30
    }
  }'

# Expected Response: 201 Created
```

#### **2. Status Polling Testing:**
```bash
# ทดสอบการตรวจสอบสถานะ
curl -X GET https://api.digitalsignage.com/api/device-registration/123/status

# Expected Responses:
# - 200 OK (Pending/Approved/Rejected/Expired)
# - 404 Not Found (Invalid registration ID)
```

#### **3. Heartbeat Testing:**
```bash
# ทดสอบการส่ง heartbeat
curl -X POST https://api.digitalsignage.com/api/device/heartbeat \
  -H "Authorization: DeviceKey dev_test123" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceKey": "dev_test123",
    "timestamp": "2025-10-09T12:00:00Z",
    "status": "Online"
  }'

# Expected Response: 200 OK
```

### 🧪 Integration Testing Checklist

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| ✅ **Device Registration** | ลงทะเบียนอุปกรณ์ใหม่ | รับ PIN และ Registration ID |
| ✅ **Status Polling** | Polling สถานะทุก 5 วินาที | รับสถานะที่ถูกต้อง |
| ✅ **Admin Approval** | Admin อนุมัติผ่าน Dashboard | Device Key ถูกส่งกลับ |
| ✅ **Heartbeat Service** | ส่ง heartbeat ทุก 30 วินาที | ไม่มี error, connection alive |
| ✅ **Content Retrieval** | ดึงตารางเวลาและสื่อ | ได้รับ presigned URLs |
| ✅ **SignalR Connection** | เชื่อมต่อ WebSocket | รับ events แบบ real-time |
| ✅ **Error Handling** | จำลองข้อผิดพลาดต่างๆ | แสดง error messages ที่เหมาะสม |

### 🔍 Load Testing Guidelines

#### **Performance Benchmarks:**
- **Registration Endpoint:** รองรับ 100 requests/minute ต่อ server
- **Heartbeat Endpoint:** รองรับ 1000 requests/minute ต่อ server  
- **Content Endpoint:** รองรับ 500 requests/minute ต่อ server
- **WebSocket Connections:** รองรับ 10,000 concurrent connections

#### **Test Scenarios:**
```bash
# Load testing ด้วย Apache Bench
ab -n 100 -c 10 -H "Authorization: DeviceKey dev_test123" \
   https://api.digitalsignage.com/api/device/heartbeat

# Load testing ด้วย curl-loader
curl-loader -f test-config.json
```

---

## ❌ Error Handling

### 📋 Common HTTP Status Codes

| Status Code | คำอธิบาย | การดำเนินการ |
|-------------|----------|--------------|
| **200 OK** | ดำเนินการสำเร็จ | ✅ ดำเนินการต่อ |
| **201 Created** | สร้างทรัพยากรสำเร็จ | ✅ บันทึกข้อมูลที่ได้รับ |
| **204 No Content** | ไม่มีเนื้อหา | ⚠️ ใช้ fallback content |
| **400 Bad Request** | ข้อมูลไม่ถูกต้อง | ❌ แสดง validation errors |
| **401 Unauthorized** | ไม่มีสิทธิ์เข้าถึง | 🔑 ตรวจสอบ device key |
| **404 Not Found** | ไม่พบทรัพยากร | ❓ ตรวจสอบ URL และ parameters |
| **409 Conflict** | ข้อมูลซ้ำ | ⚠️ แสดงข้อความแจ้งเตือน |
| **429 Too Many Requests** | เกิน rate limit | ⏳ รอตาม retry-after header |
| **500 Internal Server Error** | ข้อผิดพลาดเซิร์ฟเวอร์ | 🔄 retry ด้วย exponential backoff |

### 🔄 Retry Strategies

#### **Exponential Backoff Implementation:**
```javascript
class RetryManager {
    static async withRetry(fn, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await this.sleep(delay);
            }
        }
    }
    
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// การใช้งาน
try {
    const result = await RetryManager.withRetry(
        () => api.sendHeartbeat(data),
        3,  // จำนวนครั้งสูงสุด
        1000 // delay เริ่มต้น 1 วินาที
    );
} catch (error) {
    console.error('Failed after retries:', error);
    showErrorMessage('Cannot connect to server');
}
```

#### **Network Error Handling:**
```javascript
class NetworkErrorHandler {
    static handle(error, context) {
        switch (error.status) {
            case 0:
                return this.handleNetworkDown(context);
            case 401:
                return this.handleUnauthorized(context);
            case 429:
                return this.handleRateLimit(error, context);
            case 500:
                return this.handleServerError(context);
            default:
                return this.handleGenericError(error, context);
        }
    }
    
    static handleNetworkDown(context) {
        console.log('Network is down, switching to offline mode');
        OfflineManager.enableOfflineMode();
        showNotification('เชื่อมต่ออินเทอร์เน็ตไม่ได้ กำลังทำงานแบบ offline');
    }
    
    static handleRateLimit(error, context) {
        const retryAfter = error.headers['retry-after'] * 1000;
        console.log(`Rate limited, retry after ${retryAfter}ms`);
        setTimeout(() => context.retry(), retryAfter);
    }
}
```

### 🚨 Error Message Localization

#### **Thai Error Messages:**
```javascript
const ERROR_MESSAGES = {
    'network_error': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    'device_key_invalid': 'รหัสอุปกรณ์ไม่ถูกต้อง กรุณาลงทะเบียนใหม่',
    'registration_expired': 'การลงทะเบียนหมดอายุแล้ว กรุณาลงทะเบียนใหม่',
    'device_rejected': 'การลงทะเบียนถูกปฏิเสธโดยผู้ดูแลระบบ',
    'content_load_failed': 'ไม่สามารถโหลดเนื้อหาได้ กำลังแสดงเนื้อหาสำรอง',
    'websocket_disconnected': 'การเชื่อมต่อ real-time ขาดหาย กำลังพยายามเชื่อมต่อใหม่'
};

function showLocalizedError(errorKey, details = null) {
    const message = ERROR_MESSAGES[errorKey] || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    showErrorDialog(message, details);
}
```

---

## 📚 สรุปการใช้งาน

### 🔄 Complete Workflow
```
1. 📱 Device Registration:
   ส่งข้อมูลครบถ้วน → แสดง QR → รอการอนุมัติ → ได้ deviceKey

2. 💓 Normal Operation:
   ส่ง heartbeat ทุก 30 วินาที + เชื่อมต่อ WebSocket + ดึงตารางเวลาทุก 5 นาที

3. 🎯 Content Management:
   ได้รับสื่อที่ optimize ตามฮาร์ดแวร์และการ assign ผู้ใช้

4. 🔔 Real-time Updates:
   รับ real-time updates ผ่าน WebSocket เมื่อมีการเปลี่ยนแปลง
```

### 🎯 Best Practices
- ✅ เก็บ device key อย่างปลอดภัยด้วยการเข้ารหัส
- ✅ ใช้ retry mechanism สำหรับ network requests
- ✅ Cache เนื้อหาในเครื่องเพื่อรองรับ offline mode
- ✅ Monitor system resources และส่งข้อมูลใน heartbeat
- ✅ Handle WebSocket disconnections อย่างเหมาะสม
- ✅ แสดง error messages เป็นภาษาไทยให้ผู้ใช้เข้าใจ
- ✅ Log ข้อมูลสำคัญเพื่อช่วยในการ debug

### 📞 Support & Documentation
- **API Documentation:** https://api.digitalsignage.com/docs
- **Admin Panel:** https://admin.digitalsignage.com
- **Support Email:** support@digitalsignage.com
- **Developer Portal:** https://developer.digitalsignage.com
