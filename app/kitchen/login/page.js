'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KitchenLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/kitchen/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push('/kitchen');
    else setError('Wrong password.');
  }

  return (
    <main className="login">
      <form className="glass" onSubmit={submit}>
        <span className="eyebrow">House of Chops</span>
        <h1>Kitchen</h1>
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="login__error">{error}</p>}
        <button className="btn btn-primary" type="submit">Enter</button>
      </form>
      <style jsx>{`
        .login { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        form { display: flex; flex-direction: column; gap: 14px; padding: 32px; border-radius: var(--radius-lg); width: 100%; max-width: 22rem; }
        h1 { font-family: var(--font-serif); font-size: 2rem; }
        input { padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-size: 1rem; }
        input:focus { outline: none; border-color: var(--color-accent); }
        .login__error { color: #ff8a7a; font-size: 0.9rem; }
        button { min-height: 48px; }
      `}</style>
    </main>
  );
}
