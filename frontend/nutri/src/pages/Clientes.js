import { useEffect, useState } from 'react';
import api from '../services/api';
import { Spinner, CardSkeleton } from '../components/Loading';
export default function Clientes() {
  const [usuarios, setUsuarios] = useState([]); const [clientes, setClientes] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get('/clientes/usuarios').then(r => setUsuarios(r.data)).catch(() => {}), api.get('/clientes').then(r => setClientes(r.data)).catch(() => {})]).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="container" style={{ padding: '18px 16px' }}><Spinner /> Carregando clientes...</div>;
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <h2>Clientes vinculados</h2>
      <p style={{ color: 'var(--muted)' }}>Usuários que te escolheram (Google/adminRef) + clientes manuais da coleção Cliente.</p>
      <div className="grid grid-3">
        {usuarios.map(u => (
          <div key={u._id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <img alt="" src={u.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=dcfce7`} style={{ width: 44, height: 44, borderRadius: 999 }} />
              <div><b>{u.nome}</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</div></div>
            </div>
          </div>
        ))}
      </div>
      {usuarios.length === 0 && <p style={{ color: 'var(--muted)' }}>Nenhum usuário vinculado ainda — peça para o cliente se cadastrar e te escolher.</p>}
      <h3 style={{ marginTop: 18 }}>Clientes manuais</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="table card" style={{ overflow: 'hidden' }}>
          <thead><tr><th>Nome</th><th>Email</th><th>Status</th></tr></thead>
          <tbody>{clientes.map(c => <tr key={c._id}><td>{c.nome}</td><td>{c.email || '—'}</td><td><span className="badge">{c.ativo ? 'ativo' : 'inativo'}</span></td></tr>)}{clientes.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--muted)' }}>Nenhum cliente manual</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
