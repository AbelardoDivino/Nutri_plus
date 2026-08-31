import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton({ adminRef }) {
  const nav = useNavigate();
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.google) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  const handleGoogle = async (credential) => {
    try {
      const payload = { idToken: credential, adminRef: adminRef || undefined };
      const { data } = await api.post('/auth/google', payload);
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (e) { setMsg(e.response?.data?.msg || 'Erro Google'); }
  };

  const clickGoogle = () => {
    if (!window.google) return setMsg('Google SDK não carregou');
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'SEU_GOOGLE_CLIENT_ID',
      callback: (res) => handleGoogle(res.credential)
    });
    window.google.accounts.id.prompt();
    // fallback: render button
    window.google.accounts.id.renderButton(document.getElementById('gbtn'), { theme: 'outline', size: 'large' });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div id="gbtn"></div>
      <button onClick={clickGoogle} disabled={!ready} style={{ width: '100%', marginTop: 8, background: '#fff', border: '1px solid #ccc', padding: 8 }}>
        {ready ? 'Entrar com Google (Usuário)' : 'Carregando Google...'}
      </button>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <small>Só para usuários. Profissionais usam login com email/senha.</small>
    </div>
  );
}
