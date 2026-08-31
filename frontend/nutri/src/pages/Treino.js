import { useState, useEffect } from 'react';
import api from '../services/api';
export default function Treino() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [lista, setLista] = useState([]); const [msg, setMsg] = useState('');
  const load = () => { const url = user?.role === 'usuario' ? '/treino/meu' : '/treino/profissional'; api.get(url).then(r => setLista(r.data)).catch(()=>{}); };
  useEffect(load, []);
  const gerar = async () => { try { await api.post('/treino/gerar', { objetivo: 'hipertrofia', nivel: 'iniciante', frequencia: 3 }); setMsg('Treino gerado'); load(); } catch (e) { setMsg(e.response?.data?.msg || 'Erro'); } };
  return (
    <div style={{ padding: 20 }}>
      <h2>Treino {user?.role === 'usuario' ? '(meu)' : '(profissional)'}</h2>
      {user?.role !== 'usuario' && <button onClick={gerar}>Gerar treino mock/OpenAI</button>}
      {msg && <p>{msg}</p>}
      {lista.map(t => <div key={t._id} style={{ border: '1px solid #ddd', padding: 12, margin: 8 }}><b>{t.objetivo} - {t.nivel}</b><pre>{JSON.stringify(t.dias, null, 2)}</pre></div>)}
    </div>
  );
}
