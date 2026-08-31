import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
export default function RegisterProfissional() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'nutricionista' });
  const [msg, setMsg] = useState(''); const nav = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div style={{ maxWidth: 450, margin: '30px auto', border: '1px solid #0f172a', padding: 20, borderRadius: 8 }}>
      <h2>Cadastro Profissional</h2>
      <p style={{ background: '#fef3c7', padding: 8 }}>Área exclusiva para <b>Nutricionistas e Personal Trainers</b> (login com email/senha). Usuários/clientes usem <Link to="/register">Cadastro de Usuário</Link></p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="nome completo" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <input placeholder="email profissional" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="senha" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="nutricionista">Nutricionista</option>
          <option value="personal">Personal Trainer</option>
        </select>
        <button type="submit" style={{ background: '#0f172a', color: '#fff', padding: 10 }}>Criar conta profissional</button>
      </form>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <p><Link to="/login">Já tem conta? Login Profissional</Link> | <Link to="/register">Sou cliente (Usuário)</Link></p>
    </div>
  );
}
