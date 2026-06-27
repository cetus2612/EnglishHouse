'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace('/'); });
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(t('loginFail')); return; }
    router.replace('/');
  };

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <div className="brand"><span className="logo">🎓</span></div>
        <h1>{t('appName')}</h1>
        <p className="sub">{t('loginSub')}</p>
        {err && <div className="login-err">{err}</div>}
        <div className="field"><label>{t('email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
        <div className="field"><label>{t('password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn block" disabled={busy}>{busy ? t('loading') : t('login')}</button>
      </form>
    </div>
  );
}
