import { Link, useNavigate } from 'react-router-dom';
export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const nav = useNavigate();
  const sair = () => { localStorage.clear(); nav('/login'); };
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, background: '#0f172a', color: '#fff', flexWrap: 'wrap' }}>
      <Link to="/dashboard" style={{ color: '#fff', fontWeight: 700 }}>Nutri+</Link>
      {user && <><Link to="/clientes" style={{ color: '#fff' }}>Clientes</Link><Link to="/avaliacao" style={{ color: '#fff' }}>Avaliação</Link><Link to="/dieta" style={{ color: '#fff' }}>Dieta</Link><Link to="/treino" style={{ color: '#fff' }}>Treino</Link><Link to="/checkout" style={{ color: '#fff' }}>Pagamento</Link>{user.role === 'admin' && <Link to="/admin" style={{ color: '#ffd700' }}>Admin</Link>}</>}
      <span style={{ marginLeft: 'auto' }}>{user ? `${user.nome} (${user.role})` : ''}</span>
      {user ? <button onClick={sair}>Sair</button> : <><Link to="/login" style={{ color: '#fff' }}>Login</Link><Link to="/register" style={{ color: '#a7f3d0' }}>Cadastro Usuário</Link><Link to="/register-profissional" style={{ color: '#93c5fd' }}>Cadastro Profissional</Link></>}
    </nav>
  );
}
