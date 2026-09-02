import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Avaliacao from './pages/Avaliacao';
import Dieta from './pages/Dieta';
import Treino from './pages/Treino';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import RegisterProfissional from './pages/RegisterProfissional';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-profissional" element={<RegisterProfissional />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute roles={['admin','nutricionista','personal']}><Clientes /></ProtectedRoute>} />
        <Route path="/avaliacao" element={<ProtectedRoute><Avaliacao /></ProtectedRoute>} />
        <Route path="/dieta" element={<ProtectedRoute><Dieta /></ProtectedRoute>} />
        <Route path="/treino" element={<ProtectedRoute><Treino /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <footer style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>© 2026 Nutri+ • Dieta e treino com TACO API • Pagamentos Mercado Pago</footer>
    </BrowserRouter>
  );
}
