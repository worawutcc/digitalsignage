---
applyTo: '**'
---
# PostgreSQL Instructions
การออกแบบฐานข้อมูล PostgreSQL สำหรับระบบ Personal Asset Registry System (PARS)
- หลักการตั้งชื่อคอลัมน์ (Best Practices)
  - ใช้ชื่อคอลัมน์ที่สื่อความหมายและชัดเจน
  - ใช้รูปแบบ snake_case สำหรับชื่อคอลัมน์
  - หลีกเลี่ยงการใช้ชื่อที่คลุมเครือหรือสั้นเกินไป
  - ใช้ prefix หรือ suffix เพื่อระบุประเภทของข้อมูล (เช่น is_active, created_at)
    - ใช้ชื่อที่สอดคล้องกับมาตรฐานอุตสาหกรรม (เช่น email, phone_number)
- data type datetime ให้ใช้ TIMESTAMP WITH OUT TIME ZONE
    - ใช้ประเภทข้อมูล `TIMESTAMP WITH OUT TIME ZONE` 
- ชื่อ primary key / foreign key ควรมีมาตรฐาน
    - ใช้ชื่อ primary key ในรูปแบบ `id` หรือ `table_name_id` (เช่น user_id, asset_id)
    - ใช้ชื่อ foreign key ในรูปแบบ `referenced_table_name_id` (เช่น user_id, asset_id)
- ใช้ _at สำหรับ timestamp, _on สำหรับ date, _by สำหรับผู้กระทำ
    - ใช้ suffix `_at` สำหรับคอลัมน์ที่เก็บข้อมูลวันที่และเวลาที่เกิดเหตุการณ์ (เช่น created_at, updated_at)
    - ใช้ suffix `_on` สำหรับคอลัมน์ที่เก็บข้อมูลวันที่ (เช่น birth_date, event_date)
    - ใช้ suffix `_by` สำหรับคอลัมน์ที่เก็บข้อมูลผู้กระทำ (เช่น created_by, updated_by)
- ใช้ boolean สำหรับสถานะ เช่น is_active, is_deleted
    - ใช้ประเภทข้อมูล `BOOLEAN` สำหรับคอลัมน์ที่เก็บสถานะ เช่น is_active, is_deleted
- ค่าที่เกี่ยวกับ money ให้ใช้ decimal(15,2)
    - ใช้ประเภทข้อมูล `DECIMAL(15,2)` สำหรับคอลัมน์ที่เก็บข้อมูลทางการเงิน เช่น price, amount
    - ใช้ประเภทข้อมูล `INTEGER` หรือ `BIGINT` สำหรับคอลัมน์ที่เก็บข้อมูลจำนวนเต็ม เช่น quantity, stock
- ใช้ UUID สำหรับ primary key
    - ใช้ประเภทข้อมูล `UUID` สำหรับคอลัมน์ที่เป็น primary key เพื่อเพิ่มความปลอดภัยและลดความเสี่ยงจากการเดา ID