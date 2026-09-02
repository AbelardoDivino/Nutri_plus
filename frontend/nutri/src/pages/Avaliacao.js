import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Avaliacao() {
  const [form, setForm] = useState({ peso: '', altura: '', idade: '', sexo: 'masculino', nivelAtividade: 'moderado', objetivo: 'manutencao' });
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => api.get('/avaliacao').then(r => setLista(r.data)).catch(() => {});
  useEffect(load, []);
  const submit = async e => {
    e.preventDefault();
    try { const { data } = await api.post('/avaliacao/calcular', { ...form, peso: Number(form.peso), altura: Number(form.altura), idade: Number(form.idade) }); setMsg(`IMC ${data.calculo.imc} • TMB ${data.calculo.tmb} • TDEE ${data.calculo.tdee} • ${data.calculo.classificacao}`); load(); } catch (err) { setMsg(err.response?.data?.msg || JSON.stringify(err.response?.data?.errors) || 'Erro'); }
  };
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <h2>Avaliação Física</h2>
      <div className="grid grid-2">
        <form onSubmit={submit} className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
          <h3 style={{ margin: 0 }}>Nova avaliação</h3>
          <div className="grid grid-3"><input className="input" placeholder="peso kg" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} required /><input className="input" placeholder="altura cm" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} required /><input className="input" placeholder="idade" value={form.idade} onChange={e => setForm({ ...form, idade: e.target.value })} required /></div>
          <div className="grid grid-3"><select className="input" value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select><select className="input" value={form.nivelAtividade} onChange={e => setForm({ ...form, nivelAtividade: e.target.value })}><option value="sedentario">Sedentário</option><option value="leve">Leve</option><option value="moderado">Moderado</option><option value="ativo">Ativo</option><option value="muito_ativo">Muito ativo</option></select><select className="input" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })}><option value="manutencao">Manutenção</option><option value="emagrecimento">Emagrecimento</option><option value="hipertrofia">Hipertrofia</option></select></div>
          <button className="btn btn-primary" type="submit">Calcular e salvar</button>
          {msg && <p style={{ background: 'var(--green-50)', padding: 10, borderRadius: 10 }}>{msg}</p>}
        </form>
        <div>
          <h3>Histórico</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {lista.map(a => (
              <div key={a._id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div><b>{a.peso}kg • {a.altura}cm • {a.idade}a</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>{a.sexo} • {a.nivelAtividade}</div></div>
                <div style={{ textAlign: 'right' }}><div><span className="badge">IMC {a.imc}</span> <span className="badge" style={{ background: '#fef3c7' }}>TDEE {a.tdee}</span></div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.caloriasAlvo} kcal alvo</div></div>
              </div>
            ))}
            {lista.length === 0 && <p style={{ color: 'var(--muted)' }}>Nenhuma avaliação ainda</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
