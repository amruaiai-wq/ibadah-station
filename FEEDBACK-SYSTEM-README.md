# ระบบรายงานข้อผิดพลาด (Content Feedback System)

ระบบที่ช่วยให้ผู้ใช้สามารถรายงานข้อผิดพลาดหรือข้อเสนอแนะเกี่ยวกับเนื้อหาต่างๆ ในเว็บไซต์ได้

## 🎯 ฟีเจอร์

### สำหรับผู้ใช้
- ✅ ปุ่มรายงานข้อผิดพลาดแบบลอยอยู่มุมล่างขวา (Floating button)
- ✅ ฟอร์มรายงานที่สวยงามและใช้งานง่าย
- ✅ สามารถรายงานได้โดยไม่ต้องเข้าสู่ระบบ (Anonymous feedback)
- ✅ สามารถระบุอีเมลเพื่อติดตามผล (ไม่บังคับ)
- ✅ เลือกประเภทข้อผิดพลาดได้ 7 ประเภท:
  - ข้อความอาหรับผิด
  - คำแปลผิด
  - ข้อมูลไม่ถูกต้อง
  - ลิงก์เสีย
  - เนื้อหาขาดหาย
  - ข้อเสนอแนะ
  - อื่นๆ
- ✅ สามารถแนบข้อเสนอการแก้ไขได้

### สำหรับ Admin
- ✅ หน้า Dashboard จัดการรายงาน
- ✅ สถิติรายงานแบบเรียลไทม์
- ✅ กรองรายงานตามสถานะ, ประเภทหน้า, หมวดหมู่
- ✅ ค้นหารายงาน
- ✅ เปลี่ยนสถานะรายงาน (pending → reviewing → resolved/dismissed)
- ✅ เพิ่มบันทึกภายใน (Admin note)
- ✅ ลบรายงาน
- ✅ รองรับภาษาไทยและอังกฤษ

## 📁 ไฟล์ที่สร้างขึ้น

### 1. Database Schema
```
supabase-feedback-schema.sql
```
- ตาราง `feedback_categories` - หมวดหมู่การรายงาน
- ตาราง `content_feedback` - รายงานจากผู้ใช้
- Row Level Security (RLS) policies
- Functions สำหรับสถิติ

### 2. TypeScript Types
```
lib/feedback-types.ts
```
- `FeedbackCategory` - ข้อมูลหมวดหมู่
- `ContentFeedback` - ข้อมูลรายงาน
- `CreateFeedbackInput` - Input สำหรับสร้างรายงาน
- `UpdateFeedbackInput` - Input สำหรับอัพเดทรายงาน
- `FeedbackStats` - สถิติ
- `FeedbackFilters` - ตัวกรอง

### 3. API Routes
```
app/api/feedback/route.ts
app/api/feedback/[id]/route.ts
app/api/feedback/categories/route.ts
```
- `POST /api/feedback` - ส่งรายงานใหม่
- `GET /api/feedback` - ดึงรายการรายงาน (admin only)
- `GET /api/feedback/[id]` - ดูรายงานเดียว
- `PATCH /api/feedback/[id]` - อัพเดทรายงาน (admin only)
- `DELETE /api/feedback/[id]` - ลบรายงาน (admin only)
- `GET /api/feedback/categories` - ดึงหมวดหมู่ทั้งหมด

### 4. UI Components
```
components/feedback/FeedbackButton.tsx
components/feedback/FeedbackModal.tsx
```
- `FeedbackButton` - ปุ่มรายงานข้อผิดพลาด (รองรับ variant: floating/inline)
- `FeedbackModal` - Modal ฟอร์มรายงาน พร้อม animation

### 5. Admin Page
```
app/admin/feedback/page.tsx
```
- Dashboard จัดการรายงาน
- ตารางแสดงรายงานทั้งหมด
- ฟิลเตอร์และค้นหา
- Modal รายละเอียดพร้อมฟอร์มอัพเดท

### 6. Translations
```
messages/th.json
messages/en.json
```
เพิ่มส่วน `feedback.*` ครบทั้งภาษาไทยและอังกฤษ

## 🚀 การติดตั้ง

### 1. สร้าง Database Tables
เรียกใช้ SQL script ใน Supabase Dashboard:
```bash
# คัดลอกเนื้อหาจาก supabase-feedback-schema.sql
# ไปรันใน Supabase SQL Editor
```

### 2. การใช้งานในหน้าต่างๆ

#### Journey Pages
```tsx
import FeedbackButton from '@/components/feedback/FeedbackButton';

<FeedbackButton
  pageType="journey"
  pagePath={`/${locale}/journey/salah`}
  pageTitle={t('title')}
  variant="floating"
/>
```

#### Article Pages
```tsx
<FeedbackButton
  pageType="article"
  pagePath={`/${locale}/articles/${slug}`}
  pageTitle={article.title}
  contentId={article.id}
  variant="floating"
/>
```

#### Quiz Pages
```tsx
<FeedbackButton
  pageType="quiz"
  pagePath={`/${locale}/quiz/${quizId}`}
  pageTitle={quiz.title}
  contentId={quizId}
  contentExcerpt="Question about..."
  variant="inline"
/>
```

### 3. เข้าถึงหน้า Admin
```
/admin/feedback
```

## 📊 Database Schema

### feedback_categories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Unique slug (e.g., 'incorrect_arabic') |
| name_th | TEXT | ชื่อภาษาไทย |
| name_en | TEXT | ชื่อภาษาอังกฤษ |
| icon | TEXT | Emoji icon |
| sort_order | INTEGER | ลำดับการแสดง |

### content_feedback
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users (nullable) |
| user_email | TEXT | สำหรับ anonymous users |
| page_type | TEXT | journey/article/quiz/wisdom/qna/other |
| page_path | TEXT | เส้นทางหน้าเว็บ |
| page_title | TEXT | ชื่อหน้า |
| content_id | TEXT | ID ของเนื้อหา (step number, quiz ID, etc.) |
| content_excerpt | TEXT | ข้อความที่มีปัญหา |
| category_id | UUID | Foreign key to feedback_categories |
| category_slug | TEXT | Denormalized category slug |
| subject | TEXT | หัวข้อรายงาน |
| description | TEXT | รายละเอียด |
| suggested_correction | TEXT | ข้อเสนอการแก้ไข |
| status | TEXT | pending/reviewing/resolved/dismissed |
| admin_note | TEXT | บันทึกของ admin |
| resolved_by | UUID | Admin ที่แก้ไข |
| resolved_at | TIMESTAMP | เวลาที่แก้ไข |
| created_at | TIMESTAMP | เวลาที่สร้าง |
| updated_at | TIMESTAMP | เวลาที่อัพเดท |

## 🔐 Security (RLS Policies)

### feedback_categories
- ✅ Public read access

### content_feedback
- ✅ Anyone can submit (INSERT)
- ✅ Users can read their own feedback
- ✅ Admins can read all feedback
- ✅ Admins can update/delete feedback

## 🎨 UI/UX Features

### Floating Button
- ลอยอยู่มุมล่างขวาจอ
- สีไล่เฉดจากส้มอ่อนไปเข้ม
- มี hover effect และ animation
- ไอคอนสามเหลี่ยมเตือน (⚠️)

### Modal Form
- Header สีไล่เฉดสวยงาม
- Form fields ครบถ้วน
- Real-time validation
- Success/Error messages
- Smooth animations ด้วย Framer Motion
- Responsive design

### Admin Dashboard
- Stats cards แสดงสถิติ
- Filter และ Search
- Table แสดงรายการ
- Detail modal พร้อมฟอร์มอัพเดท
- Color-coded status badges

## 🌐 i18n Support

รองรับทั้งภาษาไทยและอังกฤษผ่าน next-intl:
- UI labels
- Placeholder texts
- Error messages
- Category names
- Page type names

## 📝 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: เพิ่มปุ่มในหน้า Journey
```tsx
// app/[locale]/journey/umrah/page.tsx
<FeedbackButton
  pageType="journey"
  pagePath={`/${locale}/journey/umrah`}
  pageTitle="Umrah Journey"
/>
```

### ตัวอย่างที่ 2: เพิ่มปุ่มแบบ inline
```tsx
<div className="flex justify-between items-center">
  <h2>Article Title</h2>
  <FeedbackButton
    pageType="article"
    pagePath={pathname}
    pageTitle={title}
    variant="inline"
    className="ml-4"
  />
</div>
```

### ตัวอย่างที่ 3: รายงานข้อผิดพลาดในขั้นตอนเฉพาะ
```tsx
<FeedbackButton
  pageType="journey"
  pagePath={`/${locale}/journey/salah`}
  pageTitle="Salah Journey"
  contentId={`step-${stepIndex}`}
  contentExcerpt={step.description}
/>
```

## 🔮 Future Enhancements (ที่สามารถเพิ่มได้)

- [ ] LINE notification เมื่อมีรายงานใหม่
- [ ] Email notification สำหรับผู้รายงาน
- [ ] Screenshot upload
- [ ] Rich text editor สำหรับ suggested correction
- [ ] Bulk actions ในหน้า admin
- [ ] Export รายงานเป็น CSV/Excel
- [ ] Dashboard analytics และ charts
- [ ] Auto-categorization ด้วย AI
- [ ] Public feedback forum

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Database schema ว่ารันสำเร็จหรือไม่
2. ตรวจสอบ RLS policies
3. ตรวจสอบ API routes ใน Network tab
4. ดู Console logs

---

**เวอร์ชัน:** 1.0.0
**สร้างเมื่อ:** 2026-02-03
**ทดสอบแล้วใน:** Next.js 14.2, Supabase, React 18
