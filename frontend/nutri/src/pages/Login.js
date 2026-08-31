import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton';
export default function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      if (data.precisaCompletarDados) return nav('/avaliacao');
      nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || 'Erro'); }
  };
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Login</h2>
      <p><b>Profissional/Admin:</b> use email/senha abaixo. <b>Usuário:</b> use Google.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        <button type="submit">Entrar com Email (Profissional)</button>
      </form>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <hr style={{ margin: '16px 0' }} />
      <GoogleLoginButton />
      <p style={{ marginTop: 12 }}><Link to="/register">Não tem conta? Cadastre-se</Link> | <Link to="/admin">Área Admin</Link></p>
    </div>
  );
}
