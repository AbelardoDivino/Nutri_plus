import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const sair = () => { localStorage.clear(); nav('/login'); setOpen(false); };
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" style={{ fontWeight: 900, letterSpacing: .5, color: 'var(--green-700)' }}>Nutri+</Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dieta">Dieta</Link>
          <Link to="/treino">Treino</Link>
          <Link to="/checkout">Pagamento</Link>
          {user?.role === 'admin' && <Link to="/admin" style={{ color: '#b45309' }}>Admin</Link>}
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? <><span className="badge">{user.role}</span><span style={{ fontWeight: 700, display: 'none' }} className="hide-mobile">{user.nome}</span><button className="btn btn-ghost" onClick={sair}>Sair</button></> : <><Link className="btn btn-ghost" to="/login">Login</Link><Link className="btn btn-primary" to="/register">Começar</Link></>}
          <button className="burger" onClick={() => setOpen(v => !v)}>☰</button>
        </div>
      </div>
      {open && (
        <div className="mobile-menu container">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/clientes" onClick={() => setOpen(false)}>Clientes</Link>
          <Link to="/avaliacao" onClick={() => setOpen(false)}>Avaliação</Link>
          <Link to="/dieta" onClick={() => setOpen(false)}>Dieta</Link>
          <Link to="/treino" onClick={() => setOpen(false)}>Treino</Link>
          <Link to="/checkout" onClick={() => setOpen(false)}>Pagamento</Link>
          {!user && <><Link to="/register" onClick={() => setOpen(false)}>Cadastro Usuário</Link><Link to="/register-profissional" onClick={() => setOpen(false)}>Cadastro Profissional</Link></>}
        </div>
      )}
    </header>
  );
}
