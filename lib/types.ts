export interface Teacher {
  id: number; name: string; email: string | null; phone: string | null; subject: string | null;
}
export interface Student {
  id: number; name: string; phone: string | null;
}
export interface Course {
  id: number; name: string; description: string | null; price: number; default_hours: number;
}
export interface Enrollment {
  id: number; student_id: number; course_id: number;
  hours_purchased: number; hours_remaining: number; price_paid: number;
  student_name?: string; course_name?: string;
}
export interface Schedule {
  id: number; course_id: number; teacher_id: number | null; title: string | null;
  date: string; start_time: string | null; end_time: string | null;
  hours: number; room: string | null; status: 'scheduled' | 'finished';
  course_name?: string; teacher_name?: string;
}
export interface RosterRow {
  student_id: number; student_name: string; hours_remaining: number;
  attendance_status: 'present' | 'late' | 'absent' | null; hours_deducted: number | null;
}
