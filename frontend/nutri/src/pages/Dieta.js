import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Dieta() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState(''); const [q, setQ] = useState(''); const [busca, setBusca] = useState([]);
  const load = () => { const url = user?.role === 'usuario' ? '/dieta/minha' : '/dieta/profissional'; api.get(url).then(r => setLista(r.data)).catch(() => {}); };
  useEffect(load, []);
  const buscar = async () => { if (!q) return; const { data } = await api.get(`/alimentos/buscar?q=${encodeURIComponent(q)}`); setBusca(data); };
  const gerarManual = async () => {
    try {
      const avals = await api.get('/avaliacao'); const avalId = avals.data[0]?._id;
      const refeicoes = [{ nome: 'Café', horario: '07:00', alimentos: busca.slice(0, 2).map(b => ({ nome: b.nome, quantidade: b.porcao, calorias: b.kcal })), calorias: busca.slice(0, 2).reduce((s, b) => s + b.kcal, 0) }];
      const payload = avalId ? { avaliacaoId: avalId, refeicoes } : { caloriasAlvo: 2000, refeicoes };
      await api.post('/dieta/gerar', payload); setMsg('Dieta manual criada'); load();
    } catch (e) { setMsg(e.response?.data?.msg || 'Erro'); }
  };
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <h2>Dieta {user?.role === 'usuario' ? '(minha)' : '(profissional — montagem manual)'}</h2>
      {user?.role !== 'usuario' && (
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>Consultar alimentos (TACO)</h3>
          <div style={{ display: 'flex', gap: 8 }}><input className="input" placeholder="ex: arroz, frango, ovo" value={q} onChange={e => setQ(e.target.value)} /><button className="btn btn-ghost" onClick={buscar}>Buscar</button><button className="btn btn-primary" onClick={gerarManual}>Criar dieta com selecionados</button></div>
          <div className="grid grid-3" style={{ marginTop: 10 }}>{busca.map(b => <div key={b.nome} className="card" style={{ padding: 10 }}><b>{b.nome}</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>{b.porcao} • {b.kcal} kcal • {b.fonte}</div></div>)}</div>
          {msg && <p>{msg}</p>}
        </div>
      )}
      <div className="grid grid-2">
        {lista.map(d => (
          <div key={d._id} className="card" style={{ overflow: 'hidden' }}>
            <img alt="" src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=260&fit=crop&sig=${d._id.slice(-2)}`} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{d.caloriasAlvo} kcal</b><span className="badge">{d.fonte}</span></div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{d.macros?.proteinas}P • {d.macros?.carboidratos}C • {d.macros?.gorduras}G</div>
              <details style={{ marginTop: 8 }}><summary>Ver refeições</summary><pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{JSON.stringify(d.refeicoes, null, 2)}</pre></details>
            </div>
          </div>
        ))}
      </div>
      {lista.length === 0 && <p style={{ color: 'var(--muted)' }}>Nenhuma dieta ainda</p>}
    </div>
  );
}
