# 🎓 ระบบจัดการโรงเรียน · School Manager (Next.js + Supabase)

เวอร์ชันใหม่ที่รื้อสร้างด้วย **Next.js (App Router)** + **Supabase (Postgres + Auth)**
พร้อม routing จริงทุกหน้า (refresh แล้วอยู่หน้าเดิม), ระบบล็อกอินแอดมิน, และสองภาษา ไทย/English

## ฟีเจอร์

- ล็อกอินแอดมิน (Supabase Auth) — ข้อมูลถูกป้องกันด้วย Row Level Security
- นักเรียน / อาจารย์ / คอร์ส (เพิ่ม-แก้-ลบ)
- ขายคอร์ส (เลือกได้หลายนักเรียน × หลายคอร์สพร้อมกัน) + แก้ไข/ลบชั่วโมง
- ตารางเรียน: เลือกนักเรียนต่อคาบ, คำนวณเวลาจบจากชั่วโมง, ห้ามเลือกวันย้อนหลัง
- มุมมอง **รายการ** และ **ปฏิทิน** + filter จบ/ยังไม่จบ
- เช็คชื่อ (ปุ่ม มาเรียน/สาย/ขาด) + จบคลาสแล้วหักชั่วโมงอัตโนมัติ (atomic ผ่าน RPC)
- หน้าภาพรวม: สรุปยอด + กิจกรรมวันนี้

---

## 1) สร้างฐานข้อมูลบน Supabase

1. ไปที่ https://supabase.com → สร้างโปรเจกต์ใหม่ (เลือก region ใกล้ไทย เช่น Singapore)
2. เมนูซ้าย **SQL Editor** → New query → วางเนื้อหาทั้งหมดจากไฟล์ `supabase/schema.sql` → กด **Run**
   (สร้างตาราง, index, RLS และฟังก์ชัน `get_roster` / `finish_schedule`)

## 2) สร้างผู้ใช้แอดมิน

1. เมนู **Authentication → Users → Add user**
2. ใส่ email + password ของแอดมิน แล้วติ๊ก **Auto Confirm User**
3. แนะนำ: ไปที่ **Authentication → Providers → Email** แล้ว **ปิด** "Allow new users to sign up"
   เพื่อไม่ให้คนอื่นสมัครเองได้ (เหลือแค่แอดมินที่เราสร้าง)

## 3) เอาค่า API key

เมนู **Project Settings → API** จะเห็น:
- **Project URL** → ใช้เป็น `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → ใช้เป็น `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## รันบนเครื่อง (local)

ต้องมี **Node.js 18.18+ หรือ 20+**

```bash
cd school-next
cp .env.local.example .env.local      # แล้วแก้ใส่ค่าจากข้อ 3
npm install
npm run dev
```

เปิด http://localhost:3000 → ล็อกอินด้วยแอดมินที่สร้างไว้

---

## Deploy ขึ้น Vercel (ฟรี)

1. push โค้ดขึ้น GitHub (โฟลเดอร์ `school-next`)
2. ไปที่ https://vercel.com → **Add New → Project** → เลือก repo
3. ตั้ง **Root Directory** = `school-next` (ถ้า repo มีหลายโฟลเดอร์)
4. ส่วน **Environment Variables** ใส่:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กด **Deploy** — เสร็จแล้วจะได้ URL `xxxx.vercel.app`

> เปลี่ยนโค้ดแล้ว push ขึ้น GitHub Vercel จะ deploy ให้อัตโนมัติ

---

## ข้อควรรู้

- **ความปลอดภัย**: ทุกตารางเปิด RLS อนุญาตเฉพาะผู้ที่ล็อกอินแล้ว (authenticated) เท่านั้น
  ต่อให้รู้ anon key ก็อ่าน/เขียนข้อมูลไม่ได้ถ้าไม่ได้ล็อกอิน
- **Supabase free tier**: ฐานข้อมูล 500MB และจะถูก **pause ถ้าไม่มี query แตะ DB เกิน 7 วัน**
  (กด restore ได้จาก dashboard) — ถ้าใช้งานสม่ำเสมอไม่มีปัญหา
- **โครงสร้าง**
  ```
  school-next/
  ├── app/
  │   ├── login/page.tsx           หน้าเข้าสู่ระบบ
  │   └── (app)/                   กลุ่มหน้าใช้งาน (มี guard + sidebar)
  │       ├── layout.tsx           ตรวจ session + เมนู
  │       ├── page.tsx             ภาพรวม
  │       ├── students/ teachers/ courses/ enrollments/ schedules/
  ├── components/                  Modal, Toast, AttendanceModal, EditEnrollment, bits
  ├── lib/                         supabase client, db (data layer), types, i18n
  └── supabase/schema.sql          สคีมาฐานข้อมูล (รันใน Supabase)
  ```
