import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Spinner, CardSkeleton } from '../components/Loading';
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [me, setMe] = useState(null); const [stats, setStats] = useState({}); const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const reqs = [api.get('/auth/me').then(r => setMe(r.data.user)).catch(() => {})];
    if (user?.role !== 'usuario') {
      reqs.push(api.get('/clientes/usuarios').then(r => setStats(s => ({ ...s, clientes: r.data.length }))).catch(() => {}));
      reqs.push(api.get('/avaliacao').then(r => setStats(s => ({ ...s, avaliacoes: r.data.length }))).catch(() => {}));
      reqs.push(api.get('/dieta/profissional').then(r => setStats(s => ({ ...s, dietas: r.data.length }))).catch(() => {}));
    } else {
      reqs.push(api.get('/dieta/minha').then(r => setStats(s => ({ ...s, dietas: r.data.length }))).catch(() => {}));
      reqs.push(api.get('/treino/meu').then(r => setStats(s => ({ ...s, treinos: r.data.length }))).catch(() => {}));
    }
    Promise.all(reqs).finally(() => setLoading(false));
  }, []);
  if (!user) return <div className="container" style={{ padding: 20 }}>Faça login</div>;
  const isProf = user.role !== 'usuario';
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div><h2 style={{ margin: 0 }}>Olá, {me?.nome || user.nome}</h2><p style={{ color: 'var(--muted)', margin: 0 }}>{isProf ? 'Painel profissional' : 'Seu painel'} • {user.email}</p></div>
        <span className="badge">{user.role}</span>
      </div>
      {loading ? <div className="grid grid-4" style={{ marginTop: 16 }}><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div> : (
        <div className="grid grid-4" style={{ marginTop: 16 }}>
          {isProf ? (
            <>
              <div className="card kpi"><small>Clientes vinculados</small><h3>{stats.clientes ?? 0}</h3><Link to="/clientes" style={{ color: 'var(--green-700)', fontSize: 13 }}>Ver clientes →</Link></div>
              <div className="card kpi"><small>Avaliações</small><h3>{stats.avaliacoes ?? 0}</h3><Link to="/avaliacao" style={{ color: 'var(--green-700)', fontSize: 13 }}>Nova avaliação →</Link></div>
              <div className="card kpi"><small>Dietas criadas</small><h3>{stats.dietas ?? 0}</h3><Link to="/dieta" style={{ color: 'var(--green-700)', fontSize: 13 }}>Gerenciar →</Link></div>
              <div className="card kpi" style={{ background: 'var(--green-900)', color: '#fff' }}><small style={{ color: '#a7f3d0' }}>Atalho</small><h3 style={{ color: '#fff' }}>TACO API</h3><div style={{ fontSize: 13, color: '#dcfce7' }}>Buscar calorias grátis</div></div>
            </>
          ) : (
            <>
              <div className="card kpi"><small>Minhas dietas</small><h3>{stats.dietas ?? 0}</h3><Link to="/dieta" style={{ fontSize: 13, color: 'var(--green-700)' }}>Ver dieta →</Link></div>
              <div className="card kpi"><small>Meus treinos</small><h3>{stats.treinos ?? 0}</h3><Link to="/treino" style={{ fontSize: 13, color: 'var(--green-700)' }}>Ver treino →</Link></div>
              <div className="card kpi"><small>Profissional</small><h3 style={{ fontSize: 16 }}>{me?.adminRef?.nome || '—'}</h3><div style={{ fontSize: 13, color: 'var(--muted)' }}>{me?.adminRef?.email || ''}</div></div>
              <div className="card kpi"><small>Plano</small><h3>Ativo</h3><Link to="/checkout" style={{ fontSize: 13, color: 'var(--green-700)' }}>Pagamento →</Link></div>
            </>
          )}
        </div>
      )}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}><h3 style={{ marginTop: 0 }}>Evolução</h3><div style={{ height: 120, background: 'linear-gradient(90deg,#dcfce7,#f0fdf4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Gráfico em breve (peso/IMC)</div></div>
        <div className="card" style={{ padding: 16 }}><h3 style={{ marginTop: 0 }}>Próximos passos</h3><ul style={{ color: 'var(--muted)', paddingLeft: 18 }}><li>Avaliação IMC/TMB/TDEE em /avaliacao</li><li>Montar dieta manual com TACO em /dieta</li><li>Gerar treino em /treino</li></ul></div>
      </div>
    </div>
  );
}
