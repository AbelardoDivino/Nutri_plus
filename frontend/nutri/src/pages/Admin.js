import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
export default function Admin() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => api.get('/auth/admins').then(r => setLista(r.data)).catch(() => setMsg('Sem permissão admin'));
  useEffect(load, []);
  const submit = async e => {
    e.preventDefault();
    try { await api.post('/auth/admin', form); setMsg('Admin criado'); load(); } catch (err) { setMsg(err.response?.data?.msg || 'Erro'); }
  };
  return (
    <div style={{ padding: 20, maxWidth: 500, border: '1px solid #dc2626', borderRadius: 8, margin: '20px auto' }}>
      <h2>Cadastro de Admin (Área Restrita)</h2>
      <p style={{ background: '#fee2e2', padding: 8 }}>Só <b>Super Usuários (admin)</b> acessam aqui. Diferente de <Link to="/register">Usuário</Link> e <Link to="/register-profissional">Profissional</Link></p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <input placeholder="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="senha" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
        <button type="submit">Criar Admin</button>
      </form>
      {msg && <p>{msg}</p>}
      <h3>Admins/Profissionais</h3>
      {lista.map(u => <div key={u._id} style={{ border: '1px solid #ddd', padding: 8, margin: 4 }}>{u.nome} - {u.email} - {u.role}</div>)}
    </div>
  );
}
