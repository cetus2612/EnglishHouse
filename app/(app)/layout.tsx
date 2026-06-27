'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';

const NAV = [
  { href: '/', icon: '📊', key: 'nav.dashboard' },
  { href: '/students', icon: '🧑‍🎓', key: 'nav.students' },
  { href: '/teachers', icon: '👩‍🏫', key: 'nav.teachers' },
  { href: '/courses', icon: '📚', key: 'nav.courses' },
  { href: '/enrollments', icon: '🛒', key: 'nav.sales' },
  { href: '/schedules', icon: '🗓️', key: 'nav.schedules' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) router.replace('/login'); else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/login');
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [router]);

  if (!ready) return <div className="login-wrap"><div className="muted">{t('loading')}</div></div>;

  const logout = async () => { await supabase.auth.signOut(); router.replace('/login'); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">🎓</span>
          <div>
            <div className="brand-name">{t('appName')}</div>
            <div className="brand-sub">School Manager</div>
          </div>
        </div>
        <nav>
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={'nav-btn' + (active ? ' active' : '')}>
                <span className="ic">{n.icon}</span><span>{t(n.key)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="side-foot">
          <div className="lang-switch">
            <button className={lang === 'th' ? 'active' : ''} onClick={() => setLang('th')}>ไทย</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <button className="logout-btn" onClick={logout}>🚪 {t('logout')}</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
