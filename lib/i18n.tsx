'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Lang = 'th' | 'en';

const T: Record<Lang, Record<string, string>> = {
  th: {
    appName: 'ระบบจัดการโรงเรียน',
    'nav.dashboard': 'ภาพรวม', 'nav.students': 'นักเรียน', 'nav.teachers': 'อาจารย์',
    'nav.courses': 'คอร์ส', 'nav.sales': 'ขายคอร์ส', 'nav.schedules': 'ตารางเรียน',
    dashboard: 'ภาพรวม', dashboardSub: 'สรุปข้อมูลโรงเรียนของคุณ',
    todayActivities: 'กิจกรรมวันนี้', noToday: 'วันนี้ไม่มีคาบเรียน',
    students: 'นักเรียน', studentsSub: 'จัดการรายชื่อนักเรียน',
    teachers: 'อาจารย์', teachersSub: 'เพิ่มอาจารย์เพื่อใช้เลือกตอนสร้างตารางสอน',
    courses: 'คอร์สเรียน', coursesSub: 'จัดการคอร์สและราคา',
    sales: 'ขายคอร์ส', salesSub: 'ลงทะเบียนคอร์สให้นักเรียน และเพิ่มชั่วโมงเรียน',
    schedules: 'ตารางเรียน', schedulesSub: 'สร้างคาบเรียน เช็คชื่อ และหักชั่วโมงเมื่อจบคลาส',
    add: 'เพิ่ม', edit: 'แก้ไข', del: 'ลบ', save: 'บันทึก', cancel: 'ยกเลิก', close: 'ปิด',
    name: 'ชื่อ', email: 'อีเมล', phone: 'เบอร์โทร', parentPhone: 'เบอร์โทรผู้ปกครอง', subject: 'วิชา/ความถนัด',
    actions: 'จัดการ', confirmDel: 'ยืนยันการลบ?',
    statStudents: 'นักเรียน', statTeachers: 'อาจารย์', statCourses: 'คอร์ส',
    statEnroll: 'การลงทะเบียน', statUpcoming: 'คาบที่ยังไม่จบ',
    addStudent: 'เพิ่มนักเรียน', addTeacher: 'เพิ่มอาจารย์', addCourse: 'เพิ่มคอร์ส',
    sellCourse: 'ขายคอร์ส', addSchedule: 'เพิ่มตารางเรียน',
    price: 'ราคา (บาท)', defaultHours: 'ชั่วโมงต่อคอร์ส', description: 'รายละเอียด',
    student: 'นักเรียน', course: 'คอร์ส', teacher: 'อาจารย์', hours: 'ชั่วโมง',
    hoursRemaining: 'ชั่วโมงคงเหลือ', hoursPurchased: 'ชั่วโมงที่ซื้อ', pricePaid: 'ยอดชำระ',
    date: 'วันที่', start: 'เริ่ม', end: 'จบ', room: 'สถานที่', status: 'สถานะ',
    title: 'หัวข้อคาบ', selectTeacher: '— เลือกอาจารย์ —', selectStudent: '— เลือกนักเรียน —',
    selectCourse: '— เลือกคอร์ส —',
    scheduled: 'ยังไม่จบ', finished: 'จบแล้ว',
    checkAttendance: 'เช็คชื่อ', finishClass: 'จบคลาส (หักชั่วโมง)',
    attendance: 'เช็คชื่อเข้าเรียน', present: 'มาเรียน', absent: 'ขาด', late: 'สาย', notChecked: 'ยังไม่เช็ค',
    deducted: 'หักแล้ว', roster: 'รายชื่อนักเรียนในคอร์สนี้',
    finishConfirm: 'จบคลาสนี้และหักชั่วโมงนักเรียนที่มาเรียน?',
    classFinished: 'คลาสนี้จบแล้ว — ชั่วโมงถูกหักเรียบร้อย',
    noStudents: 'ยังไม่มีนักเรียน', noTeachers: 'ยังไม่มีอาจารย์', noCourses: 'ยังไม่มีคอร์ส',
    noEnroll: 'ยังไม่มีการขายคอร์ส', noSchedules: 'ยังไม่มีตารางเรียน',
    noRoster: 'ยังไม่มีนักเรียนลงคอร์สนี้ — ไปขายคอร์สก่อน',
    saved: 'บันทึกแล้ว', deleted: 'ลบแล้ว', sold: 'ขายคอร์สสำเร็จ', hrs: 'ชม.',
    hoursHint: 'เว้นว่างเพื่อใช้ชั่วโมงเริ่มต้นของคอร์ส',
    lowHours: 'เหลือน้อย', enrolledCourses: 'คอร์สที่ลงเรียน', delCourse: 'ลบคอร์ส',
    selectAll: 'เลือก/ไม่เลือกทั้งหมด',
    multiHint: 'เลือกได้หลายนักเรียนและหลายคอร์ส — ใช้ชั่วโมง/ราคาเริ่มต้นของแต่ละคอร์ส',
    selectStudentCourse: 'เลือกนักเรียนและคอร์สอย่างน้อยอย่างละ 1',
    needStudentsCourses: 'ต้องมีนักเรียนและคอร์สก่อนจึงจะขายได้',
    classStudents: 'นักเรียนในคาบนี้',
    pickCourseFirst: 'เลือกคอร์สก่อน เพื่อแสดงรายชื่อนักเรียน',
    noEnrolledInCourse: 'ยังไม่มีนักเรียนลงคอร์สนี้ — ไปขายคอร์สก่อน',
    hoursAutoHint: 'ใส่ชั่วโมง แล้วเลือกเวลาเริ่ม ระบบจะคำนวณเวลาจบให้ (แก้เองได้)',
    noBackdate: 'เลือกวันย้อนหลังไม่ได้',
    filterAll: 'ทั้งหมด', viewList: 'รายการ', viewCalendar: 'ปฏิทิน', today: 'วันนี้',
    login: 'เข้าสู่ระบบ', logout: 'ออกจากระบบ', password: 'รหัสผ่าน',
    loginSub: 'เข้าสู่ระบบสำหรับผู้ดูแล', loginFail: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    loading: 'กำลังโหลด...',
  },
  en: {
    appName: 'School Manager',
    'nav.dashboard': 'Dashboard', 'nav.students': 'Students', 'nav.teachers': 'Teachers',
    'nav.courses': 'Courses', 'nav.sales': 'Sell Course', 'nav.schedules': 'Schedule',
    dashboard: 'Dashboard', dashboardSub: 'Overview of your school',
    todayActivities: "Today's schedule", noToday: 'No classes today',
    students: 'Students', studentsSub: 'Manage student records',
    teachers: 'Teachers', teachersSub: 'Add teachers to assign when creating schedules',
    courses: 'Courses', coursesSub: 'Manage courses and pricing',
    sales: 'Sell Course', salesSub: 'Enroll students into courses and add class hours',
    schedules: 'Schedule', schedulesSub: 'Create classes, take attendance, deduct hours on finish',
    add: 'Add', edit: 'Edit', del: 'Delete', save: 'Save', cancel: 'Cancel', close: 'Close',
    name: 'Name', email: 'Email', phone: 'Phone', parentPhone: "Parent's phone", subject: 'Subject',
    actions: 'Actions', confirmDel: 'Confirm delete?',
    statStudents: 'Students', statTeachers: 'Teachers', statCourses: 'Courses',
    statEnroll: 'Enrollments', statUpcoming: 'Open classes',
    addStudent: 'Add Student', addTeacher: 'Add Teacher', addCourse: 'Add Course',
    sellCourse: 'Sell Course', addSchedule: 'Add Schedule',
    price: 'Price (THB)', defaultHours: 'Hours per course', description: 'Description',
    student: 'Student', course: 'Course', teacher: 'Teacher', hours: 'Hours',
    hoursRemaining: 'Hours left', hoursPurchased: 'Hours bought', pricePaid: 'Amount paid',
    date: 'Date', start: 'Start', end: 'End', room: 'Location', status: 'Status',
    title: 'Class title', selectTeacher: '— Select teacher —', selectStudent: '— Select student —',
    selectCourse: '— Select course —',
    scheduled: 'Open', finished: 'Finished',
    checkAttendance: 'Attendance', finishClass: 'Finish class (deduct hours)',
    attendance: 'Attendance', present: 'Present', absent: 'Absent', late: 'Late', notChecked: 'Not checked',
    deducted: 'Deducted', roster: 'Students enrolled in this course',
    finishConfirm: 'Finish this class and deduct hours from present students?',
    classFinished: 'Class finished — hours deducted',
    noStudents: 'No students yet', noTeachers: 'No teachers yet', noCourses: 'No courses yet',
    noEnroll: 'No sales yet', noSchedules: 'No schedules yet',
    noRoster: 'No students enrolled in this course — sell the course first',
    saved: 'Saved', deleted: 'Deleted', sold: 'Course sold', hrs: 'hrs',
    hoursHint: 'Leave blank to use the course default hours',
    lowHours: 'Low', enrolledCourses: 'Enrolled courses', delCourse: 'Remove course',
    selectAll: 'Toggle all',
    multiHint: 'Pick multiple students and courses — uses each course default hours/price',
    selectStudentCourse: 'Select at least one student and one course',
    needStudentsCourses: 'Add students and courses first',
    classStudents: 'Students in this class',
    pickCourseFirst: 'Select a course first to list students',
    noEnrolledInCourse: 'No students enrolled in this course — sell the course first',
    hoursAutoHint: 'Enter hours then pick start time; end time is auto-calculated (editable)',
    noBackdate: 'Cannot select a past date',
    filterAll: 'All', viewList: 'List', viewCalendar: 'Calendar', today: 'Today',
    login: 'Sign in', logout: 'Sign out', password: 'Password',
    loginSub: 'Admin sign in', loginFail: 'Invalid email or password',
    loading: 'Loading...',
  },
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }
const LangCtx = createContext<Ctx>({ lang: 'th', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th');
  useEffect(() => {
    const saved = (localStorage.getItem('lang') as Lang) || 'th';
    setLangState(saved);
    document.documentElement.lang = saved;
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('lang', l); document.documentElement.lang = l; };
  const t = (k: string) => T[lang][k] ?? k;
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);

/* ---------- shared helpers ---------- */
export const fmtDate = (iso: string) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
export const localISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const baht = (n: number, lang: Lang) => Number(n || 0).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US');
