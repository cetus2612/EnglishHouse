'use client';
import { useEffect, useState } from 'react';
import { Schedules } from '@/lib/db';
import type { Schedule, RosterRow } from '@/lib/types';
import { useLang, fmtDate } from '@/lib/i18n';
import { Modal, useToast } from '@/components/ui';
import { HoursBadge } from '@/components/bits';

export function AttendanceModal({ schedule, onClose, onDone }: { schedule: Schedule; onClose: () => void; onDone: () => void }) {
  const { t, lang } = useLang();
  const toast = useToast();
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const finished = schedule.status === 'finished';

  useEffect(() => { Schedules.roster(schedule.id).then(setRoster).catch((e) => toast(e.message, true)); }, [schedule.id, toast]);

  const setAtt = async (sid: number, status: string) => {
    if (finished) return;
    try {
      await Schedules.setAttendance(schedule.id, sid, status);
      setRoster((rs) => rs.map((r) => (r.student_id === sid ? { ...r, attendance_status: status as any } : r)));
      toast(t('saved'));
    } catch (e: any) { toast(e.message, true); }
  };
  const finish = async () => {
    if (!confirm(t('finishConfirm'))) return;
    try { await Schedules.finish(schedule.id); toast(t('classFinished')); onDone(); } catch (e: any) { toast(e.message, true); }
  };

  return (
    <Modal title={t('attendance')} onClose={onClose}>
      <p className="muted" style={{ marginTop: 0 }}>
        {schedule.course_name} · {fmtDate(schedule.date)} · {schedule.hours} {t('hrs')}/{lang === 'th' ? 'คาบ' : 'class'}
      </p>
      {finished && <div className="badge gray" style={{ marginBottom: 12 }}>{t('classFinished')}</div>}
      <h2 className="sec">{t('roster')}</h2>
      {!roster.length ? <div className="empty">{t('noRoster')}</div> : (
        <div className="card"><table><thead><tr>
          <th>{t('student')}</th><th className="right">{t('hoursRemaining')}</th><th>{t('attendance')}</th>
        </tr></thead><tbody>
          {roster.map((r) => (
            <tr key={r.student_id}>
              <td><b>{r.student_name}</b></td>
              <td className="right"><HoursBadge h={r.hours_remaining} />
                {finished && r.hours_deducted ? <div className="muted" style={{ fontSize: 12 }}>-{r.hours_deducted} {t('deducted')}</div> : null}</td>
              <td>{finished
                ? <span className={'badge ' + (r.attendance_status === 'absent' ? 'red' : 'green')}>{r.attendance_status ? t(r.attendance_status) : t('notChecked')}</span>
                : <div className="att-group">
                    {(['present', 'late', 'absent'] as const).map((st) => (
                      <button key={st} type="button" className={'att-btn ' + st + (r.attendance_status === st ? ' on' : '')} onClick={() => setAtt(r.student_id, st)}>{t(st)}</button>
                    ))}
                  </div>}
              </td>
            </tr>
          ))}
        </tbody></table></div>
      )}
      <div className="form-actions" style={{ marginTop: 16 }}>
        <button className="btn ghost" onClick={onClose}>{t('close')}</button>
        {!finished && roster.length > 0 && <button className="btn green" onClick={finish}>{t('finishClass')}</button>}
      </div>
    </Modal>
  );
}
