import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton';
export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const submit = async e => {
    e.preventDefault(); setMsg('');
    if (!email.trim() || !senha.trim()) { setMsg('Preencha email e senha'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), senha });
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      if (data.precisaCompletarDados) return nav('/avaliacao');
      nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Credenciais inválidas'); } finally { setLoading(false); }
  };
  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 20, padding: '24px 16px', alignItems: 'center' }}>
      <div className="card" style={{ padding: 18 }}>
        <span className="badge">Acesso profissional</span>
        <h2 style={{ margin: '8px 0' }}>Entrar na plataforma</h2>
        <p style={{ color: 'var(--muted)' }}>Profissionais usam email/senha. Clientes preferem Google.</p>
        <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input className="input" placeholder="seu@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" placeholder="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar com Email'}</button>
        </form>
        {msg && <p style={{ color: '#dc2626' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}><Link className="btn btn-ghost" to="/register">Criar conta de usuário</Link><Link className="btn btn-ghost" to="/register-profissional">Sou profissional</Link></div>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Usuário — entrar com Google</h3>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Login rápido para clientes. Escolha o profissional na próxima etapa.</p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
