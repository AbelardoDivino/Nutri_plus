import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
export default function RegisterProfissional() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'nutricionista' });
  const [msg, setMsg] = useState(''); const [loading, setLoading] = useState(false); const nav = useNavigate();
  const submit = async e => {
    e.preventDefault(); if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6) { setMsg('Preencha nome, email válido e senha com 6+ caracteres'); return; }
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); localStorage.setItem('user', JSON.stringify(data.user));
      nav('/dashboard');
    } catch (err) { setMsg(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || err.message); } finally { setLoading(false); }
  };
  return (
    <div className="container" style={{ padding: '20px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div className="card" style={{ padding: 16, background: 'linear-gradient(135deg,#0b3d2e 0%,#15803d 100%)', color: '#fff', border: 'none' }}>
          <span className="badge" style={{ background: '#dcfce7', color: '#0b3d2e' }}>EXCLUSIVO PARA PROFISSIONAIS</span>
          <h1 style={{ margin: '8px 0 4px', fontSize: 'clamp(22px,3vw,28px)' }}>Cadastro Profissional — Nutri+</h1>
          <p style={{ margin: 0, color: '#dcfce7' }}>Área <b>só para Nutricionistas e Personal Trainers</b>. Você terá painel para gerenciar clientes, criar avaliações (IMC/TMB/TDEE) e montar <b>dieta e treino manualmente</b> para cada usuário que te escolher. Clientes <b>não</b> se cadastram aqui — eles usam <Link to="/register" style={{ color: '#fef08a', textDecoration: 'underline' }}>Cadastro de Usuário</Link>.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>O que você ganha após se cadastrar</h3>
            <ul style={{ color: 'var(--muted)', paddingLeft: 18, lineHeight: 1.6 }}>
              <li><b>Painel profissional</b> em /dashboard com seus clientes vinculados</li>
              <li><b>Aba Clientes</b> — lista usuários que te escolheram via Google ou cadastro</li>
              <li><b>Avaliação</b> — calcula IMC/TMB/TDEE e calorias alvo</li>
              <li><b>Dieta</b> — busca alimentos TACO (grátis) e monta manual para o cliente</li>
              <li><b>Treino</b> — gera treino por objetivo/nível (só Personal)</li>
            </ul>
            <div style={{ background: 'var(--sand)', border: '1px dashed var(--line)', borderRadius: 10, padding: 10, fontSize: 13, color: 'var(--muted)' }}>
              <b>Login depois:</b> use <b>email + senha</b> em <Link to="/login" style={{ color: 'var(--green-700)' }}>/login</Link>. Usuários usam Google.
            </div>
          </div>
          <form onSubmit={submit} noValidate className="card" style={{ padding: 18, display: 'grid', gap: 10 }}>
            <h3 style={{ margin: 0 }}>Crie sua conta profissional</h3>
            <label style={{ fontWeight: 700, fontSize: 14 }}>Nome completo *</label>
            <input className="input" placeholder="Ex: Dr. João Silva" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            <label style={{ fontWeight: 700, fontSize: 14 }}>Email profissional *</label>
            <input className="input" placeholder="Ex: joao@nutriplus.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label style={{ fontWeight: 700, fontSize: 14 }}>Senha (mínimo 6 caracteres) *</label>
            <input className="input" placeholder="Crie uma senha segura" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
            <label style={{ fontWeight: 700, fontSize: 14 }}>Você é *</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="nutricionista">Nutricionista — monta DIETA (TACO API)</option><option value="personal">Personal Trainer — monta TREINO</option></select>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '14px 18px', fontSize: 16 }}>{loading ? 'Criando...' : 'Criar conta profissional →'}</button>
            {msg && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 10, borderRadius: 8 }}>{msg}</p>}
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Ao criar, você concorda com os termos. Já tem conta? <Link to="/login" style={{ color: 'var(--green-700)', fontWeight: 700 }}>Faça login</Link> · É cliente? <Link to="/register" style={{ color: 'var(--green-700)' }}>Cadastre-se como usuário</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
