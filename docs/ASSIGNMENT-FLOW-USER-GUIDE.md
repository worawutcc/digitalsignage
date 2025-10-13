# 🎯 Assignment Creation Flow - User Guide

## การสร้าง Assignment ใหม่ - คู่มือผู้ใช้

### 📋 Overview: Assignment คืออะไร?
**Assignment** คือการมอบหมายเนื้อหา (Content) ไปแสดงผลที่อุปกรณ์ (Device) เฉพาะในช่วงเวลาที่กำหนด

**ตัวอย่าง:**
- มอบหมาย "โฆษณาสินค้าใหม่" (Media) ไปแสดงที่ "จอ TV ชั้น 1" (Device) เวลา 09:00-17:00 ทุกวัน
- มอบหมาย "ข่าวประจำวัน" (Schedule) ไปแสดงที่ "กลุ่มจอโลบบี้" (Device Group) แบบฉุกเฉิน

---

## 🛠️ ขั้นตอนการสร้าง Assignment (4 Steps)

### **Step 1: Content Selection** 🎯
**จุดประสงค์:** เลือกเนื้อหาที่ต้องการแสดง

#### 1.1 เลือก Assignment Type
```
┌─────────────────────────────────────────────────────┐
│  📅 Schedule  │  📋 Playlist  │  🖼️  Media  │  ⚠️  Emergency  │
└─────────────────────────────────────────────────────┘
```

- **Schedule**: เนื้อหาตามตารางเวลาที่กำหนดไว้
- **Playlist**: ชุดเนื้อหาที่เล่นตามลำดับ
- **Media**: ไฟล์สื่อเดี่ยว (รูปภาพ, วิดีโอ)
- **Emergency**: ข้อความฉุกเฉิน (ลำดับความสำคัญสูงสุด)

#### 1.2 เลือก Content Item เฉพาะเจาะจง ⭐ **สำคัญ!**
หลังเลือก Type แล้ว **ต้องเลือก item เฉพาะ**

**ตัวอย่าง:**
- เลือก Schedule → เลือก "Morning News Program"
- เลือก Media → เลือก "Product_Advertisement.mp4"

#### ✅ เงื่อนไขผ่าน Step 1:
```
✅ เลือก Assignment Type แล้ว
✅ เลือก Content Item แล้ว
```

### **Step 2: Target Selection** 🎯
**จุดประสงค์:** เลือกอุปกรณ์ที่จะแสดงเนื้อหา

#### Target Types:
- **Device**: เลือกอุปกรณ์เฉพาะ (เช่น "TV-Lobby-01")  
- **Device Group**: เลือกกลุ่มอุปกรณ์ (เช่น "Lobby Screens", "Meeting Rooms")

#### ✅ เงื่อนไขผ่าน Step 2:
```
✅ เลือก Target Type แล้ว
✅ เลือกอุปกรณ์อย่างน้อย 1 เครื่อง
```

### **Step 3: Scheduling** ⏰
**จุดประสงค์:** กำหนดเวลาและการตั้งค่าการแสดงผล

#### การตั้งค่า:
- **Start Date**: วันที่เริ่มแสดง (required)
- **End Date**: วันที่สิ้นสุด (optional - ถ้าไม่ใส่จะแสดงต่อเนื่อง)
- **Priority**: ลำดับความสำคัญ 1-10 (10 = สูงสุด)
- **Emergency Broadcast**: ถ้าเป็นข้อความฉุกเฉิน

#### ✅ เงื่อนไขผ่าน Step 3:
```
✅ กำหนด Start Date แล้ว
✅ กำหนด Priority แล้ว (1-10)
```

### **Step 4: Review** 👀
**จุดประสงค์:** ตรวจสอบข้อมูลก่อนบันทึก

#### สิ่งที่ต้องตรวจสอบ:
- เนื้อหาที่เลือกถูกต้องหรือไม่
- อุปกรณ์ที่เลือกถูกต้องหรือไม่  
- เวลาที่กำหนดถูกต้องหรือไม่

#### กดปุ่ม "Create Assignment" เพื่อบันทึก

---

## 🚨 ปัญหาที่พบบ่อย

### ❌ ปุ่ม "Next" กดไม่ได้ (ปัญหาหลัก)

**สาเหตุ:** ข้อมูลใน Step ปัจจุบันยังไม่ครบ

**การแก้ไข:**

#### Step 1 - Content Selection:
```
✅ ตรวจสอบ: เลือก Assignment Type แล้วหรือยัง?
✅ ตรวจสอบ: เลือก Content Item เฉพาะแล้วหรือยัง?
```

**วิธีแก้:**
1. คลิกเลือก Assignment Type (Schedule/Playlist/Media/Emergency)
2. **รอให้โหลดรายการ content**
3. **คลิกเลือก content item ใดๆ จากรายการ** ⭐

#### Step 2 - Target Selection:
```
✅ ตรวจสอบ: เลือก Target Type แล้วหรือยัง?
✅ ตรวจสอบ: เลือกอุปกรณ์แล้วหรือยัง?
```

#### Step 3 - Scheduling:  
```
✅ ตรวจสอบ: กำหนด Start Date แล้วหรือยัง?
✅ ตรวจสอบ: Priority อยู่ในช่วง 1-10 หรือยัง?
```

### 🔍 การ Debug

#### เปิด Browser Developer Console:
1. กด **F12** (Windows/Linux) หรือ **Cmd+Option+I** (Mac)
2. ไปที่ tab "Console"
3. ดู logs ที่ขึ้นต้นด้วย:
   ```
   🎯 ContentSelection - Selection updated
   🔍 Validating ContentSelection
   ✅ ContentSelection validation passed
   ```

---

## 💡 เทคนิคการใช้งาน

### 1. **Emergency Assignment**
สำหรับข้อความด่วนที่ต้องแสดงทันที:
- เลือก Assignment Type: **Emergency**
- เลือก Media: ข้อความหรือรูปภาพฉุกเฉิน
- เปิด **Emergency Broadcast** ใน Step 3
- กำหนด Priority = 10 (สูงสุด)

### 2. **Recurring Schedule** 
สำหรับเนื้อหาที่แสดงซ้ำทุกวัน:
- เลือก Assignment Type: **Schedule**
- เลือก Schedule ที่มี recurrence pattern
- ไม่ต้องกำหนด End Date (จะแสดงต่อเนื่อง)

### 3. **Device Group Assignment**
สำหรับแสดงเนื้อหาเดียวกันหลายจอ:
- Step 2: เลือก Target Type: **Device Group** 
- เลือก Group ที่ต้องการ (เช่น "Lobby Screens")
- ประหยัดเวลากว่าการเลือกทีละจอ

---

## 📞 การติดต่อสำหรับความช่วยเหลือ

หากยังมีปัญหา กรุณาส่งข้อมูลต่อไปนี้:
1. **Screenshot** หน้าจอที่มีปัญหา
2. **Console Logs** จาก Browser Developer Tools
3. **ขั้นตอนที่ทำ** ก่อนเจอปัญหา

---

**Last Updated:** October 13, 2025  
**Version:** 1.0  
**Status:** ✅ Active