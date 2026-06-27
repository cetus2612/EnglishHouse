-- ============================================================
--  School Manager — Supabase schema
--  วิธีใช้: เปิด Supabase → SQL Editor → วางทั้งไฟล์นี้ → Run
-- ============================================================

-- ---------- Tables ----------
create table if not exists teachers (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  phone text,
  subject text,
  created_at timestamptz default now()
);

create table if not exists students (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  created_at timestamptz default now()
);

create table if not exists courses (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric not null default 0,
  default_hours numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  id bigint generated always as identity primary key,
  student_id bigint not null references students(id) on delete cascade,
  course_id bigint not null references courses(id) on delete cascade,
  hours_purchased numeric not null default 0,
  hours_remaining numeric not null default 0,
  price_paid numeric not null default 0,
  created_at timestamptz default now(),
  unique (student_id, course_id)
);

create table if not exists schedules (
  id bigint generated always as identity primary key,
  course_id bigint not null references courses(id) on delete cascade,
  teacher_id bigint references teachers(id) on delete set null,
  title text,
  date date not null,
  start_time text,
  end_time text,
  hours numeric not null default 1,
  room text,
  status text not null default 'scheduled',
  created_at timestamptz default now()
);

create table if not exists attendance (
  id bigint generated always as identity primary key,
  schedule_id bigint not null references schedules(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  status text not null default 'present',
  hours_deducted numeric not null default 0,
  checked_at timestamptz default now(),
  unique (schedule_id, student_id)
);

create table if not exists schedule_students (
  id bigint generated always as identity primary key,
  schedule_id bigint not null references schedules(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  unique (schedule_id, student_id)
);

-- ---------- Indexes ----------
create index if not exists idx_enroll_student        on enrollments(student_id);
create index if not exists idx_enroll_course         on enrollments(course_id);
create index if not exists idx_enroll_student_course on enrollments(student_id, course_id);
create index if not exists idx_sched_course          on schedules(course_id);
create index if not exists idx_sched_teacher         on schedules(teacher_id);
create index if not exists idx_sched_date            on schedules(date);
create index if not exists idx_sched_status          on schedules(status);
create index if not exists idx_att_schedule          on attendance(schedule_id);
create index if not exists idx_att_student           on attendance(student_id);
create index if not exists idx_ss_schedule           on schedule_students(schedule_id);
create index if not exists idx_ss_student            on schedule_students(student_id);

-- ---------- Row Level Security ----------
-- เปิด RLS ทุกตาราง และอนุญาตเฉพาะผู้ที่ล็อกอินแล้ว (authenticated) เท่านั้น
do $$
declare tbl text;
begin
  foreach tbl in array array['teachers','students','courses','enrollments','schedules','attendance','schedule_students']
  loop
    execute format('alter table %I enable row level security;', tbl);
    execute format('drop policy if exists "auth_all" on %I;', tbl);
    execute format('create policy "auth_all" on %I for all to authenticated using (true) with check (true);', tbl);
  end loop;
end $$;

-- ---------- RPC: roster ของคาบ (เลือกนักเรียนเฉพาะ หรือ fallback เป็นทุกคนในคอร์ส) ----------
create or replace function get_roster(p_schedule_id bigint)
returns table (
  student_id bigint, student_name text, hours_remaining numeric,
  attendance_status text, hours_deducted numeric
)
language plpgsql security definer set search_path = public as $$
declare v_course bigint; v_chosen int;
begin
  select course_id into v_course from schedules where id = p_schedule_id;
  select count(*) into v_chosen from schedule_students where schedule_id = p_schedule_id;

  if v_chosen > 0 then
    return query
      select ss.student_id, s.name, coalesce(e.hours_remaining, 0),
             a.status, a.hours_deducted
      from schedule_students ss
      join students s on s.id = ss.student_id
      left join enrollments e on e.student_id = ss.student_id and e.course_id = v_course
      left join attendance a on a.schedule_id = p_schedule_id and a.student_id = ss.student_id
      where ss.schedule_id = p_schedule_id
      order by s.name;
  else
    return query
      select e.student_id, s.name, e.hours_remaining, a.status, a.hours_deducted
      from enrollments e
      join students s on s.id = e.student_id
      left join attendance a on a.schedule_id = p_schedule_id and a.student_id = e.student_id
      where e.course_id = v_course
      order by s.name;
  end if;
end; $$;

-- ---------- RPC: จบคลาส + หักชั่วโมง (atomic) ----------
create or replace function finish_schedule(p_schedule_id bigint)
returns void
language plpgsql security definer set search_path = public as $$
declare v_course bigint; v_hours numeric; v_status text;
begin
  select course_id, hours, status into v_course, v_hours, v_status
  from schedules where id = p_schedule_id;

  if v_status = 'finished' then
    raise exception 'already finished';
  end if;

  -- หักชั่วโมงเฉพาะคนที่มาเรียน/สาย และมี enrollment ในคอร์สนี้
  update enrollments e
    set hours_remaining = e.hours_remaining - v_hours
  from attendance a
  where a.schedule_id = p_schedule_id
    and a.status in ('present', 'late')
    and e.student_id = a.student_id
    and e.course_id = v_course;

  update attendance
    set hours_deducted = v_hours
  where schedule_id = p_schedule_id and status in ('present', 'late');

  update schedules set status = 'finished' where id = p_schedule_id;
end; $$;

-- ให้ผู้ล็อกอินเรียกฟังก์ชันได้
grant execute on function get_roster(bigint)      to authenticated;
grant execute on function finish_schedule(bigint) to authenticated;
