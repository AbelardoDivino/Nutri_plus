import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Avaliacao() {
  const [form, setForm] = useState({ peso: '', altura: '', idade: '', sexo: 'masculino', nivelAtividade: 'moderado', objetivo: 'manutencao' });
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => api.get('/avaliacao').then(r => setLista(r.data)).catch(()=>{});
  useEffect(load, []);
  const submit = async e => {
    e.preventDefault();
    try { const { data } = await api.post('/avaliacao/calcular', { ...form, peso: Number(form.peso), altura: Number(form.altura), idade: Number(form.idade) }); setMsg(`IMC ${data.calculo.imc} TMB ${data.calculo.tmb} TDEE ${data.calculo.tdee}`); load(); } catch (err) { setMsg(err.response?.data?.msg || 'Erro'); }
  };
  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Avaliação Física (Profissional)</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}><input placeholder="peso" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} required /><input placeholder="altura cm" value={form.altura} onChange={e => setForm({ ...form, altura: e.target.value })} required /><input placeholder="idade" value={form.idade} onChange={e => setForm({ ...form, idade: e.target.value })} required /></div>
        <div style={{ display: 'flex', gap: 8 }}><select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select><select value={form.nivelAtividade} onChange={e => setForm({ ...form, nivelAtividade: e.target.value })}><option value="sedentario">Sedentário</option><option value="leve">Leve</option><option value="moderado">Moderado</option><option value="ativo">Ativo</option><option value="muito_ativo">Muito ativo</option></select><select value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })}><option value="manutencao">Manutenção</option><option value="emagrecimento">Emagrecimento</option><option value="hipertrofia">Hipertrofia</option></select></div>
        <button type="submit">Calcular e salvar</button>
      </form>
      {msg && <p>{msg}</p>}
      <h3>Histórico</h3>
      {lista.map(a => <div key={a._id} style={{ border: '1px solid #ddd', padding: 8, margin: 8 }}>Peso {a.peso} Altura {a.altura} IMC {a.imc} TDEE {a.tdee} Calorias {a.caloriasAlvo}</div>)}
    </div>
  );
}
