'use client';
import { useEffect, useState } from 'react';
import { Courses } from '@/lib/db';
import type { Course } from '@/lib/types';
import { useLang, baht } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { PageHead } from '@/components/bits';

export default function CoursesPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => Courses.list().then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);

  const openForm = (r?: Course) => { setForm(r ? { ...r } : { name: '', description: '', price: 0, default_hours: 0 }); setOpen(true); };
  const save = async () => {
    if (!form.name) return toast(t('name') + ' *', true);
    try {
      const body = { name: form.name, description: form.description, price: +form.price || 0, default_hours: +form.default_hours || 0 };
      if (form.id) await Courses.update(form.id, body); else await Courses.create(body);
      setOpen(false); toast(t('saved')); load();
    } catch (e: any) { toast(e.message, true); }
  };
  const remove = async (id: number) => { if (!confirm(t('confirmDel'))) return; await Courses.remove(id); toast(t('deleted')); load(); };

  return (
    <>
      <PageHead title={t('courses')} sub={t('coursesSub')}
        action={<button className="btn" onClick={() => openForm()}>+ {t('addCourse')}</button>} />
      {rows.length ? (
        <div className="course-grid">{rows.map((r) => (
          <div className="course-card" key={r.id}>
            <div className="cc-head"><h3>{r.name}</h3><span className="cc-hours">{r.default_hours} {t('hrs')}</span></div>
            <p className="cc-desc">{r.description || <span className="muted">—</span>}</p>
            <div className="cc-price">฿{baht(r.price, lang)} <small>/ {r.default_hours} {t('hrs')}</small></div>
            <div className="cc-actions">
              <button className="btn ghost sm" onClick={() => openForm(r)}>{t('edit')}</button>
              <button className="btn danger sm" onClick={() => remove(r.id)}>{t('del')}</button>
            </div>
          </div>
        ))}</div>
      ) : <div className="card"><div className="empty">{t('noCourses')}</div></div>}

      {open && (
        <Modal title={form.id ? t('edit') : t('addCourse')} onClose={() => setOpen(false)}>
          <div className="field"><label>{t('name')} *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>{t('description')}</label>
            <textarea rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="row2">
            <div className="field"><label>{t('price')}</label>
              <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div className="field"><label>{t('defaultHours')}</label>
              <input type="number" min="0" step="0.5" value={form.default_hours} onChange={(e) => setForm({ ...form, default_hours: e.target.value })} /></div>
          </div>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn" onClick={save}>{t('save')}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
