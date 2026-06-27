'use client';
import { useState } from 'react';
import { Enrollments } from '@/lib/db';
import type { Enrollment } from '@/lib/types';
import { useLang } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';

export function EditEnrollment({ enr, onClose, onDone }: { enr: Enrollment; onClose: () => void; onDone: () => void }) {
  const { t } = useLang();
  const toast = useToast();
  const [hp, setHp] = useState(enr.hours_purchased);
  const [hr, setHr] = useState(enr.hours_remaining);
  const [pp, setPp] = useState(enr.price_paid);

  const save = async () => {
    try {
      await Enrollments.update(enr.id, { hours_purchased: +hp, hours_remaining: +hr, price_paid: +pp });
      toast(t('saved')); onDone();
    } catch (e: any) { toast(e.message, true); }
  };
  const del = async () => {
    if (!confirm(t('confirmDel'))) return;
    try { await Enrollments.remove(enr.id); toast(t('deleted')); onDone(); } catch (e: any) { toast(e.message, true); }
  };

  return (
    <Modal title={t('edit')} onClose={onClose}>
      <p className="muted" style={{ marginTop: 0 }}><b>{enr.student_name}</b> · {enr.course_name}</p>
      <div className="row2">
        <div className="field"><label>{t('hoursPurchased')}</label>
          <input type="number" step="0.5" value={hp} onChange={(e) => setHp(+e.target.value)} /></div>
        <div className="field"><label>{t('hoursRemaining')}</label>
          <input type="number" step="0.5" value={hr} onChange={(e) => setHr(+e.target.value)} /></div>
      </div>
      <div className="field"><label>{t('pricePaid')}</label>
        <input type="number" value={pp} onChange={(e) => setPp(+e.target.value)} /></div>
      <div className="form-actions" style={{ justifyContent: 'space-between' }}>
        <button className="btn danger" onClick={del}>{t('delCourse')}</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn ghost" onClick={onClose}>{t('cancel')}</button>
          <button className="btn" onClick={save}>{t('save')}</button>
        </div>
      </div>
    </Modal>
  );
}
