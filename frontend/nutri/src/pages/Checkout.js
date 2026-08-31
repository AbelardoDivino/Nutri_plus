import { useState } from 'react';
import api from '../services/api';
export default function Checkout() {
  const [plano, setPlano] = useState('mensal'); const [res, setRes] = useState(null);
  const pagar = async (tipo) => {
    try { const { data } = await api.post(`/pagamento/${tipo}`, { plano }); setRes(data); if (data.init_point) window.open(data.init_point, '_blank'); } catch (e) { setRes(e.response?.data || { msg: e.message }); }
  };
  return (
    <div style={{ padding: 20 }}>
      <h2>Pagamento - Teste Mercado Pago</h2>
      <select value={plano} onChange={e => setPlano(e.target.value)}><option value="mensal">Mensal R$49,90</option><option value="trimestral">Trimestral R$129,90</option><option value="anual">Anual R$399,90</option></select>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => pagar('checkout')}>Checkout (link MP)</button>
        <button onClick={() => pagar('pix')}>PIX (qr_code)</button>
        <button onClick={() => pagar('boleto')}>Boleto</button>
        <button onClick={() => pagar('cartao')}>Cartão (precisa token)</button>
      </div>
      {res && <pre style={{ background: '#f1f5f9', padding: 12, marginTop: 12 }}>{JSON.stringify(res, null, 2)}</pre>}
    </div>
  );
}
