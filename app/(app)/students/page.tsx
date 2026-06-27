'use client';
import { useEffect, useState } from 'react';
import { Students, Enrollments } from '@/lib/db';
import type { Student, Enrollment } from '@/lib/types';
import { useLang } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { PageHead } from '@/components/bits';
import { EditEnrollment } from '@/components/EditEnrollment';

export default function StudentsPage() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState<Student[]>([]);
  const [enr, setEnr] = useState<Enrollment[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editEnr, setEditEnr] = useState<Enrollment | null>(null);

  const load = async () => {
    try {
      const [s, e] = await Promise.all([Students.list(), Enrollments.list()]);
      setRows(s); setEnr(e);
    } catch (err: any) { toast(err.message, true); }
  };
  useEffect(() => { load(); }, []);

  const byStudent: Record<number, Enrollment[]> = {};
  enr.forEach((e) => { (byStudent[e.student_id] = byStudent[e.student_id] || []).push(e); });
  const tagCls = (h: number) => (h <= 0 ? 'red' : h <= 2 ? 'amber' : 'green');

  const openForm = (r?: Student) => { setForm(r ? { ...r } : { name: '', phone: '' }); setOpen(true); };
  const save = async () => {
    if (!form.name) return toast(t('name') + ' *', true);
    try {
      if (form.id) await Students.update(form.id, { name: form.name, phone: form.phone });
      else await Students.create({ name: form.name, phone: form.phone });
      setOpen(false); toast(t('saved')); load();
    } catch (e: any) { toast(e.message, true); }
  };
  const remove = async (id: number) => { if (!confirm(t('confirmDel'))) return; await Students.remove(id); toast(t('deleted')); load(); };

  return (
    <>
      <PageHead title={t('students')} sub={t('studentsSub')}
        action={<button className="btn" onClick={() => openForm()}>+ {t('addStudent')}</button>} />
      <div className="card"><table><thead><tr>
        <th>{t('name')}</th><th>{t('parentPhone')}</th><th>{t('enrolledCourses')}</th><th className="right">{t('actions')}</th>
      </tr></thead><tbody>
        {rows.length ? rows.map((r) => (
          <tr key={r.id}>
            <td><b>{r.name}</b></td><td>{r.phone}</td>
            <td>{(byStudent[r.id] || []).length ? (
              <div className="tags">{byStudent[r.id].map((e) => (
                <button key={e.id} type="button" className="ctag" onClick={() => setEditEnr(e)} title={t('edit')}>
                  {e.course_name}<span className={'h ' + tagCls(e.hours_remaining)}>{e.hours_remaining} {t('hrs')}</span>
                </button>
              ))}</div>
            ) : <span className="muted">—</span>}</td>
            <td className="right nowrap">
              <button className="btn ghost sm" onClick={() => openForm(r)}>{t('edit')}</button>{' '}
              <button className="btn danger sm" onClick={() => remove(r.id)}>{t('del')}</button>
            </td>
          </tr>
        )) : <tr><td colSpan={4} className="empty">{t('noStudents')}</td></tr>}
      </tbody></table></div>

      {open && (
        <Modal title={form.id ? t('edit') : t('addStudent')} onClose={() => setOpen(false)}>
          <div className="field"><label>{t('name')} *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>{t('parentPhone')}</label>
            <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn" onClick={save}>{t('save')}</button>
          </div>
        </Modal>
      )}

      {editEnr && <EditEnrollment enr={editEnr} onClose={() => setEditEnr(null)} onDone={() => { setEditEnr(null); load(); }} />}
    </>
  );
}
