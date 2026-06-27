'use client';
import { useEffect, useState } from 'react';
import { Students, Courses, Enrollments } from '@/lib/db';
import type { Student, Course, Enrollment } from '@/lib/types';
import { useLang, baht } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { PageHead, HoursBadge } from '@/components/bits';
import { EditEnrollment } from '@/components/EditEnrollment';

export default function EnrollmentsPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sell, setSell] = useState(false);
  const [selStu, setSelStu] = useState<number[]>([]);
  const [selCrs, setSelCrs] = useState<number[]>([]);
  const [editEnr, setEditEnr] = useState<Enrollment | null>(null);

  const load = () => Enrollments.list().then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);

  const openSell = async () => {
    try {
      const [s, c] = await Promise.all([Students.list(), Courses.list()]);
      setStudents(s); setCourses(c); setSelStu([]); setSelCrs([]); setSell(true);
    } catch (e: any) { toast(e.message, true); }
  };
  const toggle = (arr: number[], set: (a: number[]) => void, id: number) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const allToggle = (ids: number[], arr: number[], set: (a: number[]) => void) =>
    set(arr.length === ids.length ? [] : ids);

  const doSell = async () => {
    if (!selStu.length || !selCrs.length) return toast(t('selectStudentCourse'), true);
    try {
      let n = 0;
      for (const sid of selStu) for (const cid of selCrs) {
        const c = courses.find((x) => x.id === cid)!;
        await Enrollments.sell(sid, cid, c.default_hours, c.price); n++;
      }
      setSell(false); toast(t('sold') + ' (' + n + ')'); load();
    } catch (e: any) { toast(e.message, true); }
  };

  return (
    <>
      <PageHead title={t('sales')} sub={t('salesSub')}
        action={<button className="btn green" onClick={openSell}>+ {t('sellCourse')}</button>} />
      <div className="card"><table><thead><tr>
        <th>{t('student')}</th><th>{t('course')}</th><th className="right">{t('hoursPurchased')}</th>
        <th className="right">{t('hoursRemaining')}</th><th className="right">{t('pricePaid')}</th><th className="right">{t('actions')}</th>
      </tr></thead><tbody>
        {rows.length ? rows.map((r) => (
          <tr key={r.id}>
            <td><b>{r.student_name}</b></td><td>{r.course_name}</td>
            <td className="right">{r.hours_purchased} {t('hrs')}</td>
            <td className="right"><HoursBadge h={r.hours_remaining} low /></td>
            <td className="right">{baht(r.price_paid, lang)}</td>
            <td className="right nowrap">
              <button className="btn ghost sm" onClick={() => setEditEnr(r)}>{t('edit')}</button>{' '}
              <button className="btn danger sm" onClick={async () => { if (!confirm(t('confirmDel'))) return; await Enrollments.remove(r.id); toast(t('deleted')); load(); }}>{t('del')}</button>
            </td>
          </tr>
        )) : <tr><td colSpan={6} className="empty">{t('noEnroll')}</td></tr>}
      </tbody></table></div>

      {sell && (
        <Modal title={t('sellCourse')} onClose={() => setSell(false)}>
          {(!students.length || !courses.length) ? <div className="empty">{t('needStudentsCourses')}</div> : (
            <>
              <div className="field">
                <div className="chk-head"><label>{t('student')} *</label>
                  <button type="button" className="selall" onClick={() => allToggle(students.map((s) => s.id), selStu, setSelStu)}>{t('selectAll')}</button></div>
                <div className="checklist">{students.map((s) => (
                  <label key={s.id}><input type="checkbox" checked={selStu.includes(s.id)} onChange={() => toggle(selStu, setSelStu, s.id)} /> {s.name}</label>
                ))}</div>
              </div>
              <div className="field">
                <div className="chk-head"><label>{t('course')} *</label>
                  <button type="button" className="selall" onClick={() => allToggle(courses.map((c) => c.id), selCrs, setSelCrs)}>{t('selectAll')}</button></div>
                <div className="checklist">{courses.map((c) => (
                  <label key={c.id}><input type="checkbox" checked={selCrs.includes(c.id)} onChange={() => toggle(selCrs, setSelCrs, c.id)} /> {c.name} · {c.default_hours}{t('hrs')} · {baht(c.price, lang)}฿</label>
                ))}</div>
              </div>
              <p className="muted" style={{ fontSize: '12.5px', margin: '2px 0 4px' }}>{t('multiHint')}</p>
              <div className="form-actions">
                <button className="btn ghost" onClick={() => setSell(false)}>{t('cancel')}</button>
                <button className="btn green" onClick={doSell}>{t('sellCourse')}</button>
              </div>
            </>
          )}
        </Modal>
      )}

      {editEnr && <EditEnrollment enr={editEnr} onClose={() => setEditEnr(null)} onDone={() => { setEditEnr(null); load(); }} />}
    </>
  );
}
