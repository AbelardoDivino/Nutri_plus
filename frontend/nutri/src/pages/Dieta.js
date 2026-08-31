import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Dieta() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => {
    const url = user?.role === 'usuario' ? '/dieta/minha' : '/dieta/profissional';
    api.get(url).then(r => setLista(r.data)).catch(()=>{});
  };
  useEffect(load, []);
  const gerar = async () => {
    try { const avals = await api.get('/avaliacao'); const avalId = avals.data[0]?._id; if (!avalId) return setMsg('Crie avaliação primeiro'); const { data } = await api.post('/dieta/gerar', { avaliacaoId: avalId }); setMsg('Dieta gerada'); load(); } catch (e) { setMsg(e.response?.data?.msg || 'Erro'); }
  };
  return (
    <div style={{ padding: 20 }}>
      <h2>Dieta {user?.role === 'usuario' ? '(minha)' : '(profissional)'}</h2>
      {user?.role !== 'usuario' && <button onClick={gerar}>Gerar dieta da última avaliação (OpenAI/mock)</button>}
      {msg && <p>{msg}</p>}
      {lista.map(d => <div key={d._id} style={{ border: '1px solid #ddd', padding: 12, margin: 8 }}><b>Calorias {d.caloriasAlvo}</b><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(d.refeicoes, null, 2)}</pre></div>)}
    </div>
  );
}
