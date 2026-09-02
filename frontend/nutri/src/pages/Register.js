import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', adminRef: '', altura: '', peso: '', idade: '', sexo: 'masculino', nivelAtividade: 'moderado', objetivo: 'saude' });
  const [profs, setProfs] = useState([]); const [msg, setMsg] = useState(''); const nav = useNavigate();
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/profissionais', { headers: { Authorization: `Bearer ${localStorage.getItem('access') || ''}` } }).then(r => r.json()).then(d => Array.isArray(d) && setProfs(d)).catch(() => {});
    api.get('/auth/profissionais').then(r => setProfs(r.data)).catch(() => {});
  }, []);
  const submit = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, role: 'usuario', altura: Number(form.altura), peso: Number(form.peso), idade: Number(form.idade) };
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.message); }
  };
  return (
    <div className="container" style={{ padding: '20px 16px' }}>
      <div className="card" style={{ maxWidth: 720, margin: '0 auto', padding: 18 }}>
        <span className="badge">Cadastro de usuário</span>
        <h2 style={{ margin: '8px 0' }}>Criar conta de cliente</h2>
        <p style={{ color: 'var(--muted)' }}>Escolha um profissional e informe seus dados — já cai no painel dele com cálculos IMC/TMB/TDEE.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div className="grid grid-2"><input className="input" placeholder="nome completo" value={form.nome} onChange={e => set(e, 'nome', e.target.value)} required /><input className="input" placeholder="email" value={form.email} onChange={e => set(e, 'email', e.target.value)} required /></div>
          <input className="input" placeholder="senha (mín 6)" type="password" value={form.senha} onChange={e => set(e, 'senha', e.target.value)} required />
          <select className="input" value={form.adminRef} onChange={e => set(e, 'adminRef', e.target.value)} required><option value="">Escolha um profissional *</option>{profs.map(p => <option key={p._id} value={p._id}>{p.nome} — {p.role}</option>)}</select>
          <div className="grid grid-3"><input className="input" placeholder="altura cm ex 175" value={form.altura} onChange={e => set(e, 'altura', e.target.value)} required /><input className="input" placeholder="peso kg ex 70" value={form.peso} onChange={e => set(e, 'peso', e.target.value)} required /><input className="input" placeholder="idade" value={form.idade} onChange={e => set(e, 'idade', e.target.value)} required /></div>
          <div className="grid grid-3"><select className="input" value={form.sexo} onChange={e => set(e, 'sexo', e.target.value)}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select><select className="input" value={form.nivelAtividade} onChange={e => set(e, 'nivelAtividade', e.target.value)}><option value="sedentario">Sedentário</option><option value="leve">Leve</option><option value="moderado">Moderado</option><option value="ativo">Ativo</option><option value="muito_ativo">Muito ativo</option></select><select className="input" value={form.objetivo} onChange={e => set(e, 'objetivo', e.target.value)}><option value="saude">Saúde</option><option value="emagrecimento">Emagrecimento</option><option value="hipertrofia">Hipertrofia</option></select></div>
          <button className="btn btn-primary" type="submit">Criar conta</button>
        </form>
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}><GoogleLoginButton adminRef={form.adminRef} /></div>
        {msg && <p style={{ color: '#dc2626' }}>{msg}</p>}
        <p style={{ marginTop: 10 }}><Link to="/login">Já tem conta? Login</Link> · <Link to="/register-profissional">Sou profissional</Link></p>
      </div>
    </div>
  );
}
