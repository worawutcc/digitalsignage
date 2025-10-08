# TV Client Device API Reference
**คู่มือ API สำหรับอุปกรณ์ Android TV ในระบบ Digital Signage**

## Device Registration (Self-Registration via QR Code/PIN)
**การลงทะเบียนอุปกรณ์ TV แบบ Self-Registration ด้วย QR Code และ PIN**

- **POST `/api/device-registration/register`**
  - **วัตถุประสงค์:** อุปกรณ์ TV ส่งข้อมูลลงทะเบียนพร้อมข้อมูล hardware เพื่อรับ PIN และ QR Code สำหรับให้ admin อนุมัติ
  - **Request:**
    ```json
    {
      "deviceName": "TV-Conference-Room-A",        // (required) ชื่ออุปกรณ์ที่จะแสดงในระบบ
      "macAddress": "AA:BB:CC:DD:EE:FF",            // (required) MAC Address ของอุปกรณ์
      "hardwareInfo": {                              // (required) ข้อมูลฮาร์ดแวร์หลัก
        "displayWidth": 1920,                        // (required) ความกว้างหน้าจอ (pixels)
        "displayHeight": 1080,                       // (required) ความสูงหน้าจอ (pixels)
        "manufacturer": "Samsung",                  // (required) ผู้ผลิตอุปกรณ์
        "model": "QN65Q70AAFXZA",                   // (required) รุ่นอุปกรณ์
        "androidVersion": "11.0",                   // (required) เวอร์ชัน Android
        "apiLevel": 30,                              // (required) Android API Level
  // หมายเหตุ: apiLevel คือเลข Android API Level เช่น 29 = Android 10, 30 = Android 11 ใช้สำหรับตรวจสอบฟีเจอร์และ compatibility ของอุปกรณ์
  // --- Optional fields ---
  -      `apiLevel` **(required):** Android API Level (เลขเวอร์ชันของ Android OS เช่น 29 = Android 10, 30 = Android 11 ใช้สำหรับตรวจสอบฟีเจอร์และ compatibility ของอุปกรณ์)
        "refreshRate": 60.0,                         // (optional) อัตรารีเฟรชหน้าจอ (Hz)
        "physicalWidth": 55.0,                       // (optional) ความกว้างจอจริง (นิ้ว)
        "physicalHeight": 31.0,                      // (optional) ความสูงจอจริง (นิ้ว)
        "densityDpi": 160,                           // (optional) DPI ของหน้าจอ
        "buildFingerprint": "samsung/...",           // (optional) Build fingerprint
        "supportedFormats": ["H264", "H265", "VP9"], // (optional) รูปแบบไฟล์ที่รองรับ
        "codecCapabilities": {...},                   // (optional) ข้อมูล codec
        "additionalSpecs": {...}                      // (optional) ข้อมูล vendor อื่นๆ
      }
    }
    ```
  - **Response:**
    ```json
    {
      "id": 123,
      "deviceName": "TV-Conference-Room-A",
      "pin": "123456",
      "status": "Pending",
      "hasHardwareInfo": true,
      "hardwareDetectionJobId": 456,
      "createdAt": "2025-10-08T12:00:00Z",
      "message": "Enhanced registration successful"
    }
    ```
  - **คำอธิบาย Fields:**
    - `deviceName` **(required):** ชื่ออุปกรณ์ที่จะแสดงในระบบ
    - `macAddress` **(required):** MAC Address ของอุปกรณ์ (รูปแบบ AA:BB:CC:DD:EE:FF)
    - `hardwareInfo` **(required):** ข้อมูลฮาร์ดแวร์หลัก
      - `displayWidth` **(required):** ความกว้างหน้าจอ (pixels)
      - `displayHeight` **(required):** ความสูงหน้าจอ (pixels)
      - `manufacturer` **(required):** ผู้ผลิตอุปกรณ์
      - `model` **(required):** รุ่นอุปกรณ์
      - `androidVersion` **(required):** เวอร์ชัน Android
      - `apiLevel` **(required):** Android API Level
      - `refreshRate` *(optional):* อัตรารีเฟรชหน้าจอ (Hz)
      - `physicalWidth` *(optional):* ความกว้างจอจริง (นิ้ว)
      - `physicalHeight` *(optional):* ความสูงจอจริง (นิ้ว)
      - `densityDpi` *(optional):* DPI ของหน้าจอ
      - `buildFingerprint` *(optional):* Build fingerprint
      - `supportedFormats` *(optional):* รูปแบบไฟล์ที่รองรับ
      - `codecCapabilities` *(optional):* ข้อมูล codec
      - `additionalSpecs` *(optional):* ข้อมูล vendor อื่นๆ
    
    **หมายเหตุ:**
    - ฟิลด์ที่เป็น required ต้องส่งทุกครั้ง มิฉะนั้น backend จะ reject
    - ฟิลด์ optional สามารถข้ามได้ ระบบจะ optimize เท่าที่ข้อมูลมี

- **GET `/api/device-registration/{registrationId}/status`**
  - **วัตถุประสงค์:** TV polling เพื่อตรวจสอบสถานะการอนุมัติและรับ deviceKey เมื่อได้รับการอนุมัติ
  - **Response:**
    ```json
    {
      "status": "Pending|Approved|Rejected|Expired",
      "deviceKey": "string (if approved)",
      "deviceId": "guid (if approved)",
      "message": "string",
      "hardwareOptimizationComplete": true
    }
    ```
  - **คำอธิบาย Response:**
    - `status`: สถานะการลงทะเบียน (Pending=รอดำเนินการ, Approved=อนุมัติแล้ว, Rejected=ปฏิเสธ, Expired=หมดอายุ)
    - `deviceKey`: คีย์อุปกรณ์สำหรับเรียก API อื่น (เมื่อได้รับการอนุมัติ)
    - `hardwareOptimizationComplete`: การวิเคราะห์ฮาร์ดแวร์เสร็จสิ้นแล้ว

## Device Heartbeat
**การส่งสัญญาณชีพของอุปกรณ์**

- **POST `/api/device/heartbeat`**
  - **วัตถุประสงค์:** TV ส่งสัญญาณแจ้งสถานะการทำงานเป็นระยะๆ เพื่อให้ระบบทราบว่าอุปกรณ์ยังใช้งานได้
  - **Request:**
    ```json
    {
      "deviceKey": "string",
      "timestamp": "2025-10-08T12:00:00Z",
      "status": "Online|Offline|Error"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Heartbeat processed successfully"
    }
    ```
  - **คำอธิบาย Fields:**
    - `deviceKey`: คีย์อุปกรณ์ที่ได้รับจากการลงทะเบียน
    - `timestamp`: เวลาปัจจุบันเป็น UTC
    - `status`: สถานะอุปกรณ์ (Online=ออนไลน์, Offline=ออฟไลน์, Error=ข้อผิดพลาด)

## Get Next Schedule (Optimized for Device Hardware)
**ดึงตารางเวลาถัดไปที่เหมาะสมกับฮาร์ดแวร์ของอุปกรณ์**

- **GET `/api/device/next-schedule`**
  - **วัตถุประสงค์:** TV ดึงตารางเวลาและไฟล์สื่อที่ถูก optimize ตามความสามารถของฮาร์ดแวร์และการ assign ผู้ใช้
  - **Headers:**
    `Authorization: DeviceKey {deviceKey}`
  - **Response:**
    ```json
    {
      "scheduleId": 123,
      "name": "Morning Announcements",
      "startTime": "2025-10-08T09:00:00Z",
      "endTime": "2025-10-08T18:00:00Z",
      "priority": "High",
      "assignmentType": "User|Group|Default",
      "assignedUserId": "guid (if user-specific)",
      "media": [
        {
          "mediaId": "guid",
          "type": "Image|Video|HTML",
          "filename": "announcement.mp4",
          "presignedUrl": "https://s3.../announcement.mp4?expires=...",
          "duration": 30,
          "resolution": "1920x1080",
          "optimizedForDevice": true
        }
      ],
      "fallbackMedia": [
        {
          "mediaId": "guid",
          "type": "Image",
          "presignedUrl": "https://s3.../default.jpg?expires=..."
        }
      ]
    }
    ```
  - **คำอธิบาย Response:**
    - `scheduleId`: รหัสตารางเวลา
    - `assignmentType`: ประเภทการ assign (User=ผู้ใช้เฉพาะ, Group=กลุ่ม, Default=ค่าเริ่มต้น)
    - `media`: รายการไฟล์สื่อพร้อม presigned URL และข้อมูล optimization
    - `fallbackMedia`: สื่อทดแทนกรณีสื่อหลักใช้ไม่ได้
    - `optimizedForDevice`: ระบุว่าสื่อได้รับการ optimize สำหรับอุปกรณ์นี้แล้ว

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

## TV Client SignalR Events (WebSocket)
**เหตุการณ์แบบ Real-time ผ่าน WebSocket**

**เชื่อมต่อไปที่:** `ws://localhost:5100/ws`  
**การยืนยันตัวตน:** ต้องใช้ DeviceKey

**เหตุการณ์ต่างๆ:**

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

---

## Authentication (การยืนยันตัวตน)
- **API Calls:** ทุก API ต้องใส่ DeviceKey ใน header (`Authorization: DeviceKey {key}` หรือ `X-Device-Key: {key}`)
- **WebSocket:** การเชื่อมต่อ SignalR/WebSocket ต้องใช้ DeviceKey สำหรับยืนยันตัวตน

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

## สรุปการใช้งาน
1. **ขั้นตอนการลงทะเบียน:** ส่งข้อมูลครบถ้วน → แสดง QR → รอการอนุมัติ → ได้ deviceKey
2. **การใช้งานปกติ:** ส่ง heartbeat เป็นระยะ + เชื่อมต่อ WebSocket + ดึงตารางเวลา  
3. **การรับเนื้อหา:** ได้รับสื่อที่ optimize ตามฮาร์ดแวร์และการ assign ผู้ใช้
4. **การแจ้งเตือน:** รับ real-time updates ผ่าน WebSocket เมื่อมีการเปลี่ยนแปลง
