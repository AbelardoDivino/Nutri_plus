import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Treino() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [lista, setLista] = useState([]); const [form, setForm] = useState({ objetivo: 'hipertrofia', nivel: 'iniciante', frequencia: 3 }); const [msg, setMsg] = useState('');
  const load = () => { const url = user?.role === 'usuario' ? '/treino/meu' : '/treino/profissional'; api.get(url).then(r => setLista(r.data)).catch(() => {}); };
  useEffect(load, []);
  const gerar = async () => { try { await api.post('/treino/gerar', form); setMsg('Treino gerado'); load(); } catch (e) { setMsg(e.response?.data?.msg || 'Erro – apenas personal'); } };
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <h2>Treino {user?.role === 'usuario' ? '(meu)' : '(personal)'}</h2>
      {user?.role !== 'usuario' && (
        <div className="card" style={{ padding: 14, marginBottom: 12, display: 'grid', gap: 10 }}>
          <div className="grid grid-3">
            <select className="input" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })}><option value="hipertrofia">Hipertrofia</option><option value="emagrecimento">Emagrecimento</option><option value="condicionamento">Condicionamento</option></select>
            <select className="input" value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}><option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></select>
            <select className="input" value={form.frequencia} onChange={e => setForm({ ...form, frequencia: Number(e.target.value) })}><option value={3}>3x/sem</option><option value={4}>4x/sem</option><option value={5}>5x/sem</option></select>
          </div>
          <button className="btn btn-primary" onClick={gerar}>Gerar treino</button>
          {msg && <p>{msg}</p>}
        </div>
      )}
      <div className="grid grid-2">
        {lista.map(t => (
          <div key={t._id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{t.objetivo} • {t.nivel}</b><span className="badge">{t.frequencia}x/sem</span></div>
            {t.dias?.map(d => (
              <div key={d.dia} style={{ marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <b style={{ fontSize: 14 }}>{d.dia} — {d.grupoMuscular}</b>
                <ul style={{ margin: '6px 0 0 18px', color: 'var(--muted)', fontSize: 13 }}>{d.exercicios?.map(ex => <li key={ex.nome}>{ex.nome} — {ex.series}x{ex.repeticoes} {ex.descanso ? `• ${ex.descanso}` : ''}</li>)}</ul>
              </div>
            ))}
          </div>
        ))}
      </div>
      {lista.length === 0 && <p style={{ color: 'var(--muted)' }}>Nenhum treino ainda</p>}
    </div>
  );
}
