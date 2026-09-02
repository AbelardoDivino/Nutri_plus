import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
export default function Admin() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => api.get('/auth/admins').then(r => setLista(r.data)).catch(() => setMsg('Sem permissão admin — logue como admin'));
  useEffect(load, []);
  const submit = async e => {
    e.preventDefault();
    try { await api.post('/auth/admin', form); setMsg('Admin criado'); load(); } catch (err) { setMsg(err.response?.data?.msg || 'Erro'); }
  };
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: 16, borderLeft: '4px solid #dc2626' }}>
        <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Área restrita</span>
        <h2 style={{ margin: '8px 0' }}>Cadastro de Admin</h2>
        <p style={{ color: 'var(--muted)' }}>Só super usuários. Diferente de <Link to="/register" style={{ color: 'var(--green-700)' }}>usuário</Link> e <Link to="/register-profissional" style={{ color: 'var(--green-700)' }}>profissional</Link>.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input className="input" placeholder="nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
          <input className="input" placeholder="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="senha" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          <button className="btn btn-primary" type="submit">Criar Admin</button>
        </form>
        {msg && <p style={{ color: '#dc2626' }}>{msg}</p>}
        <h3>Admins/Profissionais</h3>
        <div style={{ display: 'grid', gap: 8 }}>{lista.map(u => <div key={u._id} className="card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between' }}><span>{u.nome} — {u.email}</span><span className="badge">{u.role}</span></div>)}</div>
      </div>
    </div>
  );
}
