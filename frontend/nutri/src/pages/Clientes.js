import { useEffect, useState } from 'react';
import api from '../services/api';
export default function Clientes() {
  const [usuarios, setUsuarios] = useState([]); const [clientes, setClientes] = useState([]);
  useEffect(() => {
    api.get('/clientes/usuarios').then(r => setUsuarios(r.data)).catch(()=>{});
    api.get('/clientes').then(r => setClientes(r.data)).catch(()=>{});
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>Meus Usuários (via Google/adminRef)</h2>
      {usuarios.length === 0 ? <p>Nenhum usuário vinculado ainda</p> : usuarios.map(u => <div key={u._id} style={{ border: '1px solid #ddd', padding: 8, margin: 8 }}>{u.nome} - {u.email} - {u.role}</div>)}
      <h3>Clientes (coleção Cliente)</h3>
      {clientes.map(c => <div key={c._id} style={{ border: '1px solid #ddd', padding: 8, margin: 8 }}>{c.nome} - {c.email}</div>)}
    </div>
  );
}
