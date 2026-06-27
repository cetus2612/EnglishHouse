'use client';
import { useEffect, useState } from 'react';
import { Teachers } from '@/lib/db';
import type { Teacher } from '@/lib/types';
import { useLang } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { PageHead } from '@/components/bits';

export default function TeachersPage() {
  const { t } = useLang();
  const toast = useToast();
  const [rows, setRows] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => Teachers.list().then(setRows).catch((e) => toast(e.message, true));
  useEffect(() => { load(); }, []);

  const openForm = (r?: Teacher) => { setForm(r ? { ...r } : { name: '', subject: '', email: '', phone: '' }); setOpen(true); };
  const save = async () => {
    if (!form.name) return toast(t('name') + ' *', true);
    try {
      if (form.id) await Teachers.update(form.id, form); else await Teachers.create(form);
      setOpen(false); toast(t('saved')); load();
    } catch (e: any) { toast(e.message, true); }
  };
  const remove = async (id: number) => { if (!confirm(t('confirmDel'))) return; await Teachers.remove(id); toast(t('deleted')); load(); };

  return (
    <>
      <PageHead title={t('teachers')} sub={t('teachersSub')}
        action={<button className="btn" onClick={() => openForm()}>+ {t('addTeacher')}</button>} />
      <div className="card"><table><thead><tr>
        <th>{t('name')}</th><th>{t('subject')}</th><th>{t('email')}</th><th>{t('phone')}</th><th className="right">{t('actions')}</th>
      </tr></thead><tbody>
        {rows.length ? rows.map((r) => (
          <tr key={r.id}>
            <td><b>{r.name}</b></td><td>{r.subject}</td><td>{r.email}</td><td>{r.phone}</td>
            <td className="right nowrap">
              <button className="btn ghost sm" onClick={() => openForm(r)}>{t('edit')}</button>{' '}
              <button className="btn danger sm" onClick={() => remove(r.id)}>{t('del')}</button>
            </td>
          </tr>
        )) : <tr><td colSpan={5} className="empty">{t('noTeachers')}</td></tr>}
      </tbody></table></div>

      {open && (
        <Modal title={form.id ? t('edit') : t('addTeacher')} onClose={() => setOpen(false)}>
          <div className="field"><label>{t('name')} *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>{t('subject')}</label>
            <input value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="row2">
            <div className="field"><label>{t('email')}</label>
              <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>{t('phone')}</label>
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
