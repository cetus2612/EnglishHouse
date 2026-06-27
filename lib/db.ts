import { supabase } from './supabase';
import type { Teacher, Student, Course, Enrollment, Schedule, RosterRow } from './types';

function unwrap<T>(res: { data: T | null; error: any }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ---------- Teachers ---------- */
export const Teachers = {
  list: () => supabase.from('teachers').select('*').order('name').then(unwrap<Teacher[]>),
  create: (b: Partial<Teacher>) => supabase.from('teachers').insert(b).select().single().then(unwrap),
  update: (id: number, b: Partial<Teacher>) => supabase.from('teachers').update(b).eq('id', id).select().single().then(unwrap),
  remove: (id: number) => supabase.from('teachers').delete().eq('id', id).then(unwrap),
};

/* ---------- Students ---------- */
export const Students = {
  list: () => supabase.from('students').select('*').order('name').then(unwrap<Student[]>),
  create: (b: Partial<Student>) => supabase.from('students').insert(b).select().single().then(unwrap),
  update: (id: number, b: Partial<Student>) => supabase.from('students').update(b).eq('id', id).select().single().then(unwrap),
  remove: (id: number) => supabase.from('students').delete().eq('id', id).then(unwrap),
};

/* ---------- Courses ---------- */
export const Courses = {
  list: () => supabase.from('courses').select('*').order('name').then(unwrap<Course[]>),
  create: (b: Partial<Course>) => supabase.from('courses').insert(b).select().single().then(unwrap),
  update: (id: number, b: Partial<Course>) => supabase.from('courses').update(b).eq('id', id).select().single().then(unwrap),
  remove: (id: number) => supabase.from('courses').delete().eq('id', id).then(unwrap),
};

/* ---------- Enrollments (ขายคอร์ส) ---------- */
export const Enrollments = {
  async list(): Promise<Enrollment[]> {
    const data = unwrap<any[]>(await supabase
      .from('enrollments')
      .select('*, students(name), courses(name)')
      .order('created_at', { ascending: false }));
    return data.map((r) => ({ ...r, student_name: r.students?.name, course_name: r.courses?.name }));
  },
  // ขายคอร์ส: ถ้ามีอยู่แล้วให้บวกชั่วโมงสะสม
  async sell(student_id: number, course_id: number, hours: number, price: number) {
    const existing = unwrap<any>(await supabase
      .from('enrollments').select('*').eq('student_id', student_id).eq('course_id', course_id).maybeSingle());
    if (existing) {
      return unwrap(await supabase.from('enrollments').update({
        hours_purchased: existing.hours_purchased + hours,
        hours_remaining: existing.hours_remaining + hours,
        price_paid: existing.price_paid + price,
      }).eq('id', existing.id).select().single());
    }
    return unwrap(await supabase.from('enrollments').insert({
      student_id, course_id, hours_purchased: hours, hours_remaining: hours, price_paid: price,
    }).select().single());
  },
  update: (id: number, b: Partial<Enrollment>) => supabase.from('enrollments').update(b).eq('id', id).select().single().then(unwrap),
  remove: (id: number) => supabase.from('enrollments').delete().eq('id', id).then(unwrap),
};

/* ---------- Schedules ---------- */
export const Schedules = {
  async list(): Promise<Schedule[]> {
    const data = unwrap<any[]>(await supabase
      .from('schedules')
      .select('*, courses(name), teachers(name)')
      .order('date', { ascending: false }));
    return data.map((r) => ({ ...r, course_name: r.courses?.name, teacher_name: r.teachers?.name }));
  },
  async create(b: Partial<Schedule>, student_ids: number[]) {
    const sched = unwrap<any>(await supabase.from('schedules').insert({
      course_id: b.course_id, teacher_id: b.teacher_id ?? null, title: b.title ?? null,
      date: b.date, start_time: b.start_time ?? null, end_time: b.end_time ?? null,
      hours: b.hours ?? 1, room: b.room ?? null,
    }).select().single());
    if (student_ids?.length) {
      await supabase.from('schedule_students')
        .insert(student_ids.map((sid) => ({ schedule_id: sched.id, student_id: sid })));
    }
    return sched;
  },
  remove: (id: number) => supabase.from('schedules').delete().eq('id', id).then(unwrap),
  roster: (id: number) => supabase.rpc('get_roster', { p_schedule_id: id }).then(unwrap<RosterRow[]>),
  setAttendance: (schedule_id: number, student_id: number, status: string) =>
    supabase.from('attendance').upsert({ schedule_id, student_id, status }, { onConflict: 'schedule_id,student_id' }).then(unwrap),
  finish: (id: number) => supabase.rpc('finish_schedule', { p_schedule_id: id }).then(unwrap),
};

/* ---------- Dashboard stats ---------- */
async function count(table: string, filter?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: c, error } = await q;
  if (error) throw new Error(error.message);
  return c ?? 0;
}
export const Stats = {
  async all() {
    const [students, teachers, courses, enrollments, upcoming] = await Promise.all([
      count('students'), count('teachers'), count('courses'), count('enrollments'),
      count('schedules', (q) => q.eq('status', 'scheduled')),
    ]);
    return { students, teachers, courses, enrollments, upcoming };
  },
};
