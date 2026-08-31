import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [me, setMe] = useState(null); const [stats, setStats] = useState({ clientes: 0, avaliacoes: 0 });
  useEffect(() => {
    api.get('/auth/me').then(r => setMe(r.data.user)).catch(()=>{});
    if (user?.role !== 'usuario') {
      api.get('/clientes/usuarios').then(r => setStats(s => ({ ...s, clientes: r.data.length }))).catch(()=>{});
      api.get('/avaliacao').then(r => setStats(s => ({ ...s, avaliacoes: r.data.length }))).catch(()=>{});
    } else {
      api.get('/dieta/minha').then(r => setStats(s => ({ ...s, dietas: r.data.length }))).catch(()=>{});
      api.get('/treino/meu').then(r => setStats(s => ({ ...s, treinos: r.data.length }))).catch(()=>{});
    }
  }, []);
  if (!user) return <p>Faça login</p>;
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard {user.role}</h2>
      <pre style={{ background: '#f1f5f9', padding: 12 }}>{JSON.stringify(me || user, null, 2)}</pre>
      {user.role !== 'usuario' ? (
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <div style={{ border: '1px solid #ccc', padding: 16 }}>Clientes vinculados: {stats.clientes}</div>
          <div style={{ border: '1px solid #ccc', padding: 16 }}>Avaliações: {stats.avaliacoes}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ border: '1px solid #ccc', padding: 16 }}>Dietas: {stats.dietas ?? 0}</div>
          <div style={{ border: '1px solid #ccc', padding: 16 }}>Treinos: {stats.treinos ?? 0}</div>
        </div>
      )}
    </div>
  );
}
