import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'usuario', adminRef: '', altura: '', peso: '', idade: '', sexo: 'masculino', nivelAtividade: 'moderado', objetivo: 'saude' });
  const [profs, setProfs] = useState([]); const [msg, setMsg] = useState(''); const nav = useNavigate();
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) api.get('/auth/profissionais').then(r => setProfs(r.data)).catch(() => api.get('/auth/profissionais').catch(()=>{}));
    // tenta sem token também busca admins públicos via login? fallback vazio
  }, []);
  // busca profs sem auth para cadastro inicial - tenta endpoint publico alternativo via fetch sem token
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/profissionais', { headers: { Authorization: `Bearer ${localStorage.getItem('access') || ''}` } }).then(r=>r.json()).then(d=>Array.isArray(d)&&setProfs(d)).catch(()=>{});
  }, []);
  const submit = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, altura: Number(form.altura), peso: Number(form.peso), idade: Number(form.idade) };
      if (!payload.adminRef) delete payload.adminRef;
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      setMsg('Criado!'); nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div style={{ maxWidth: 500, margin: '20px auto', border: '1px solid #16a34a', padding: 20, borderRadius: 8 }}>
      <h2>Cadastro de Usuário (Cliente)</h2>
      <p style={{ background: '#dcfce7', padding: 8 }}>Área exclusiva para <b>Clientes</b> — entre com Google ou email e escolha um profissional. Profissionais usem <Link to="/register-profissional">Cadastro Profissional</Link></p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="nome" value={form.nome} onChange={e => set(e, 'nome', e.target.value)} required />
        <input placeholder="email" value={form.email} onChange={e => set(e, 'email', e.target.value)} required />
        <input placeholder="senha" type="password" value={form.senha} onChange={e => set(e, 'senha', e.target.value)} required />
        <select value={form.adminRef} onChange={e => set(e, 'adminRef', e.target.value)} required>
          <option value="">Escolha um profissional *</option>
          {profs.map(p => <option key={p._id} value={p._id}>{p.nome} ({p.role})</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="altura cm ex 175" value={form.altura} onChange={e => set(e, 'altura', e.target.value)} required />
          <input placeholder="peso kg ex 70" value={form.peso} onChange={e => set(e, 'peso', e.target.value)} required />
          <input placeholder="idade" value={form.idade} onChange={e => set(e, 'idade', e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={form.sexo} onChange={e => set(e, 'sexo', e.target.value)}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select>
          <select value={form.nivelAtividade} onChange={e => set(e, 'nivelAtividade', e.target.value)}><option value="sedentario">Sedentário</option><option value="leve">Leve</option><option value="moderado">Moderado</option><option value="ativo">Ativo</option><option value="muito_ativo">Muito ativo</option></select>
        </div>
        <small>Altura, peso, idade e atividade vão direto para o profissional calcular sua dieta/treino</small>
        <button type="submit" style={{ background: '#16a34a', color: '#fff', padding: 10 }}>Cadastrar como Usuário</button>
      </form>
      <GoogleLoginButton adminRef={form.adminRef} />
      {msg && <p>{msg}</p>}
      <p style={{ marginTop: 12 }}><Link to="/login">Já tem conta? Login</Link> | <Link to="/admin">Área Admin</Link></p>
    </div>
  );
}
