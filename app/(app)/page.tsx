'use client';
import { useEffect, useState } from 'react';
import { Stats, Schedules } from '@/lib/db';
import type { Schedule } from '@/lib/types';
import { useLang, localISO, fmtDate } from '@/lib/i18n';
import { useToast } from '@/components/ui';
import { PageHead } from '@/components/bits';
import { AttendanceModal } from '@/components/AttendanceModal';

export default function DashboardPage() {
  const { t } = useLang();
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [today, setToday] = useState<Schedule[]>([]);
  const [att, setAtt] = useState<Schedule | null>(null);

  const load = async () => {
    try {
      const [s, scheds] = await Promise.all([Stats.all(), Schedules.list()]);
      setStats(s);
      const td = localISO();
      setToday(scheds.filter((x) => x.date === td).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')));
    } catch (e: any) { toast(e.message, true); }
  };
  useEffect(() => { load(); }, []);

  const cards: [string, number, string][] = stats ? [
    ['🧑‍🎓', stats.students, 'statStudents'], ['👩‍🏫', stats.teachers, 'statTeachers'],
    ['📚', stats.courses, 'statCourses'], ['🛒', stats.enrollments, 'statEnroll'],
    ['🗓️', stats.upcoming, 'statUpcoming'],
  ] : [];

  return (
    <>
      <PageHead title={t('dashboard')} sub={t('dashboardSub')} />
      <div className="stat-grid">{cards.map((c, i) => (
        <div className="stat" key={i}><span className="ic">{c[0]}</span><div className="v">{c[1]}</div><div className="l">{t(c[2])}</div></div>
      ))}</div>

      <h2 className="sec">{t('todayActivities')} · {fmtDate(localISO())}</h2>
      {today.length ? (
        <div className="today-list">{today.map((r) => (
          <div className="today-item" key={r.id}>
            <div className="ti-time">{r.start_time || '—'}{r.end_time ? <span>- {r.end_time}</span> : null}</div>
            <div className="ti-main"><b>{r.course_name}</b>{r.title ? ` · ${r.title}` : ''}
              <div className="muted">{r.teacher_name ? '👩‍🏫 ' + r.teacher_name : ''}{r.room ? ' · 📍 ' + r.room : ''}</div></div>
            <span className={'badge ' + (r.status === 'finished' ? 'gray' : 'blue')}>{t(r.status)}</span>
            <button className="btn ghost sm" onClick={() => setAtt(r)}>{t('checkAttendance')}</button>
          </div>
        ))}</div>
      ) : <div className="card"><div className="empty">{t('noToday')}</div></div>}

      {att && <AttendanceModal schedule={att} onClose={() => setAtt(null)} onDone={() => { setAtt(null); load(); }} />}
    </>
  );
}
