import { useState } from 'react';
import api from '../services/api';
export default function Checkout() {
  const [plano, setPlano] = useState('mensal'); const [res, setRes] = useState(null);
  const pagar = async (tipo) => {
    try { const { data } = await api.post(`/pagamento/${tipo}`, { plano }); setRes(data); if (data.init_point) window.open(data.init_point, '_blank'); if (data.qr_code) navigator.clipboard?.writeText(data.qr_code); } catch (e) { setRes(e.response?.data || { msg: e.message }); }
  };
  return (
    <div className="container" style={{ padding: '18px 16px' }}>
      <h2>Pagamento</h2>
      <div className="grid grid-2">
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Escolha o plano</h3>
          <select className="input" value={plano} onChange={e => setPlano(e.target.value)}><option value="mensal">Mensal R$49,90</option><option value="trimestral">Trimestral R$129,90</option><option value="anual">Anual R$399,90</option></select>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => pagar('checkout')}>Pagar com Checkout MP (link)</button>
            <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => pagar('pix')}>PIX (QR)</button><button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => pagar('boleto')}>Boleto</button></div>
            <button className="btn btn-ghost" onClick={() => pagar('cartao')}>Cartão (precisa token MP)</button>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Teste: cartão <code>5031 4332 1540 6351</code> e PIX QR em modo TEST.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Retorno</h3>
          {res ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'var(--sand)', padding: 12, borderRadius: 10 }}>{JSON.stringify(res, null, 2)}</pre> : <p style={{ color: 'var(--muted)' }}>Escolha um método</p>}
          {res?.qr_code_base64 && <img alt="qr" src={`data:image/png;base64,${res.qr_code_base64}`} style={{ marginTop: 10, width: 200 }} />}
          {res?.boleto_url && <a href={res.boleto_url} target="_blank" rel="noreferrer" style={{ color: 'var(--green-700)' }}>Abrir boleto</a>}
        </div>
      </div>
    </div>
  );
}
