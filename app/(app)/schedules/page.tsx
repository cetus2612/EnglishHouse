'use client';
import { useEffect, useState } from 'react';
import { Schedules, Courses, Teachers, Enrollments } from '@/lib/db';
import type { Schedule, Course, Teacher, Enrollment } from '@/lib/types';
import { useLang, fmtDate, localISO } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { PageHead } from '@/components/bits';
import { AttendanceModal } from '@/components/AttendanceModal';

const DOW: Record<string, string[]> = { th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };
const MONTHS: Record<string, string[]> = {
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export default function SchedulesPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState<Schedule[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'finished'>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calMonth, setCalMonth] = useState(new Date());
  const [att, setAtt] = useState<Schedule | null>(null);

  // add modal
  const [add, setAdd] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [enr, setEnr] = useState<Enrollment[]>([]);
  const today = localISO();
  const blank = { course_id: 0, teacher_id: 0, title: '', date: today, room: '', start_time: '', end_time: '', hours: 1 };
  const [form, setForm] = useState<any>(blank);
  const [selStu, setSelStu] = useState<number[]>([]);

  const load = () => Schedules.list().then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);

  const enrolledByCourse: Record<number, Enrollment[]> = {};
  enr.forEach((e) => { (enrolledByCourse[e.course_id] = enrolledByCourse[e.course_id] || []).push(e); });

  const openAdd = async () => {
    try {
      const [c, te, en] = await Promise.all([Courses.list(), Teachers.list(), Enrollments.list()]);
      setCourses(c); setTeachers(te); setEnr(en);
      setForm({ ...blank }); setSelStu([]); setAdd(true);
    } catch (e: any) { toast(e.message, true); }
  };

  const onCourse = (cid: number) => {
    setForm((f: any) => ({ ...f, course_id: cid }));
    const arr = enrolledByCourse[cid] || [];
    setSelStu(arr.map((e) => e.student_id));
  };
  const computeEnd = (start: string, hours: number) => {
    if (!start || !hours || hours <= 0) return;
    const [sh, sm] = start.split(':').map(Number);
    let total = sh * 60 + sm + Math.round(hours * 60);
    total = ((total % 1440) + 1440) % 1440;
    setForm((f: any) => ({ ...f, end_time: `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` }));
  };
  const toggleStu = (id: number) => setSelStu((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const allStu = () => {
    const ids = (enrolledByCourse[form.course_id] || []).map((e) => e.student_id);
    setSelStu(selStu.length === ids.length ? [] : ids);
  };

  const save = async () => {
    if (!form.course_id || !form.date) return toast(t('selectCourse'), true);
    if (form.date < today) return toast(t('noBackdate'), true);
    try {
      await Schedules.create({
        course_id: form.course_id, teacher_id: form.teacher_id || null, title: form.title || null,
        date: form.date, room: form.room || null, start_time: form.start_time || null,
        end_time: form.end_time || null, hours: +form.hours || 1,
      }, selStu);
      setAdd(false); toast(t('saved')); load();
    } catch (e: any) { toast(e.message, true); }
  };
  const remove = async (id: number) => { if (!confirm(t('confirmDel'))) return; await Schedules.remove(id); toast(t('deleted')); load(); };

  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);
  const cAll = rows.length, cOpen = rows.filter((r) => r.status === 'scheduled').length, cDone = rows.filter((r) => r.status === 'finished').length;

  return (
    <>
      <PageHead title={t('schedules')} sub={t('schedulesSub')}
        action={<button className="btn" onClick={openAdd}>+ {t('addSchedule')}</button>} />

      <div className="sched-toolbar">
        <div className="filterbar">
          <button className={'fbtn' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>{t('filterAll')} ({cAll})</button>
          <button className={'fbtn' + (filter === 'scheduled' ? ' on' : '')} onClick={() => setFilter('scheduled')}>{t('scheduled')} ({cOpen})</button>
          <button className={'fbtn' + (filter === 'finished' ? ' on' : '')} onClick={() => setFilter('finished')}>{t('finished')} ({cDone})</button>
        </div>
        <div className="filterbar">
          <button className={'fbtn' + (view === 'list' ? ' on' : '')} onClick={() => setView('list')}>📋 {t('viewList')}</button>
          <button className={'fbtn' + (view === 'calendar' ? ' on' : '')} onClick={() => setView('calendar')}>🗓️ {t('viewCalendar')}</button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="card"><table><thead><tr>
          <th>{t('date')}</th><th>{t('course')}</th><th>{t('teacher')}</th><th>{t('start')}-{t('end')}</th>
          <th className="right">{t('hours')}</th><th>{t('room')}</th><th>{t('status')}</th><th className="right">{t('actions')}</th>
        </tr></thead><tbody>
          {shown.length ? shown.map((r) => (
            <tr key={r.id}>
              <td className="nowrap"><b>{fmtDate(r.date)}</b></td>
              <td>{r.course_name}{r.title ? <><br /><span className="muted">{r.title}</span></> : null}</td>
              <td>{r.teacher_name || <span className="muted">—</span>}</td>
              <td className="nowrap">{r.start_time || ''}{r.end_time ? ' - ' + r.end_time : ''}</td>
              <td className="right">{r.hours} {t('hrs')}</td><td>{r.room}</td>
              <td><span className={'badge ' + (r.status === 'finished' ? 'gray' : 'blue')}>{t(r.status)}</span></td>
              <td className="right nowrap">
                <button className="btn ghost sm" onClick={() => setAtt(r)}>{t('checkAttendance')}</button>{' '}
                <button className="btn danger sm" onClick={() => remove(r.id)}>{t('del')}</button>
              </td>
            </tr>
          )) : <tr><td colSpan={8} className="empty">{t('noSchedules')}</td></tr>}
        </tbody></table></div>
      ) : (
        <Calendar rows={shown} month={calMonth} setMonth={setCalMonth} onPick={setAtt} lang={lang} t={t} />
      )}

      {add && (
        <Modal title={t('addSchedule')} onClose={() => setAdd(false)}>
          <div className="field"><label>{t('course')} *</label>
            <select value={form.course_id} onChange={(e) => onCourse(+e.target.value)}>
              <option value={0}>{t('selectCourse')}</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="field"><label>{t('teacher')}</label>
            <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: +e.target.value })}>
              <option value={0}>{t('selectTeacher')}</option>
              {teachers.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}{tt.subject ? ' · ' + tt.subject : ''}</option>)}
            </select></div>
          <div className="field">
            <div className="chk-head"><label>{t('classStudents')}</label>
              <button type="button" className="selall" onClick={allStu}>{t('selectAll')}</button></div>
            <div className="checklist">
              {!form.course_id ? <div className="muted" style={{ padding: 8 }}>{t('pickCourseFirst')}</div>
                : (enrolledByCourse[form.course_id] || []).length === 0 ? <div className="muted" style={{ padding: 8 }}>{t('noEnrolledInCourse')}</div>
                  : (enrolledByCourse[form.course_id] || []).map((e) => (
                    <label key={e.student_id}><input type="checkbox" checked={selStu.includes(e.student_id)} onChange={() => toggleStu(e.student_id)} /> {e.student_name} <span className="muted" style={{ fontSize: 12 }}>({e.hours_remaining} {t('hrs')})</span></label>
                  ))}
            </div>
          </div>
          <div className="field"><label>{t('title')}</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="row2">
            <div className="field"><label>{t('date')} *</label>
              <div className="datewrap">
                <input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <span className="date-label">{fmtDate(form.date)}</span>
              </div></div>
            <div className="field"><label>{t('room')}</label>
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
          </div>
          <div className="field"><label>{t('hours')} ({t('deducted')})</label>
            <input type="number" min="0.5" step="0.5" value={form.hours}
              onChange={(e) => { const h = e.target.value; setForm((f: any) => ({ ...f, hours: h })); computeEnd(form.start_time, +h); }} />
            <span className="muted" style={{ fontSize: 12 }}>{t('hoursAutoHint')}</span></div>
          <div className="row2">
            <div className="field"><label>{t('start')}</label>
              <input type="time" value={form.start_time}
                onChange={(e) => { const s = e.target.value; setForm((f: any) => ({ ...f, start_time: s })); computeEnd(s, +form.hours); }} /></div>
            <div className="field"><label>{t('end')}</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          </div>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setAdd(false)}>{t('cancel')}</button>
            <button className="btn" onClick={save}>{t('save')}</button>
          </div>
        </Modal>
      )}

      {att && <AttendanceModal schedule={att} onClose={() => setAtt(null)} onDone={() => { setAtt(null); load(); }} />}
    </>
  );
}

function Calendar({ rows, month, setMonth, onPick, lang, t }: {
  rows: Schedule[]; month: Date; setMonth: (d: Date) => void; onPick: (s: Schedule) => void; lang: string; t: (k: string) => string;
}) {
  const y = month.getFullYear(), m = month.getMonth();
  const byDate: Record<string, Schedule[]> = {};
  rows.forEach((r) => { (byDate[r.date] = byDate[r.date] || []).push(r); });
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const todayISO = localISO();
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < first; i++) cells.push(<div className="cal-cell blank" key={'b' + i} />);
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(
      <div className={'cal-cell' + (iso === todayISO ? ' today' : '')} key={iso}>
        <div className="cal-daynum">{d}</div>
        {(byDate[iso] || []).map((r) => (
          <button key={r.id} className={'cal-chip ' + r.status} onClick={() => onPick(r)} title={`${r.course_name} ${r.start_time || ''}`}>
            {r.start_time ? r.start_time + ' ' : ''}{r.course_name}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="cal-head">
        <div className="cal-title">{MONTHS[lang][m]} {y}</div>
        <div className="cal-nav">
          <button className="btn ghost sm" onClick={() => setMonth(new Date(y, m - 1, 1))}>‹</button>
          <button className="btn ghost sm" onClick={() => setMonth(new Date())}>{t('today')}</button>
          <button className="btn ghost sm" onClick={() => setMonth(new Date(y, m + 1, 1))}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW[lang].map((d) => <div className="cal-dow" key={d}>{d}</div>)}
        {cells}
      </div>
    </div>
  );
}
