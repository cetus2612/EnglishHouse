'use client';
import { ReactNode } from 'react';
import { useLang } from '@/lib/i18n';

export function PageHead({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1><p>{sub}</p></div>
      {action}
    </div>
  );
}

export function HoursBadge({ h, low }: { h: number; low?: boolean }) {
  const { t } = useLang();
  const cls = h <= 0 ? 'red' : h <= 2 ? 'amber' : 'green';
  const lowTxt = low && h > 0 && h <= 2 ? ` (${t('lowHours')})` : '';
  return <span className={'badge ' + cls}>{h} {t('hrs')}{lowTxt}</span>;
}
