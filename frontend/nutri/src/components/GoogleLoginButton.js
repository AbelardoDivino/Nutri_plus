import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton({ adminRef }) {
  const nav = useNavigate();
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(!!window.google);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    if (window.google) { setReady(true); renderBtn(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => { setReady(true); renderBtn(); };
    document.head.appendChild(s);
  }, []);

  const renderBtn = () => {
    if (!window.google || !btnRef.current) return;
    const cid = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!cid || cid === 'SEU_GOOGLE_CLIENT_ID') return;
    window.google.accounts.id.initialize({
      client_id: cid,
      callback: (res) => handleGoogle(res.credential),
      auto_select: true,
      cancel_on_tap_outside: false
    });
    window.google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large', width: 280, text: 'continue_with' });
    // One Tap mais rápido
    window.google.accounts.id.prompt();
  };

  const handleGoogle = async (credential) => {
    setLoading(true); setMsg('');
    try {
      const payload = { idToken: credential, adminRef: adminRef || undefined };
      const { data } = await api.post('/auth/google', payload);
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (e) { setMsg(e.response?.data?.msg || 'Erro Google — tente novamente'); } finally { setLoading(false); }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div ref={btnRef} style={{ display: 'flex', justifyContent: 'center' }}></div>
      {loading && <div style={{ textAlign: 'center', marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>Autenticando com Google…</div>}
      {!ready && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando Google…</p>}
      {msg && <p style={{ color: '#dc2626', fontSize: 13 }}>{msg}</p>}
      <small style={{ color: 'var(--muted)' }}>Usuário: Google. Profissional: email/senha. {loading ? 'Aguarde...' : ''}</small>
    </div>
  );
}
