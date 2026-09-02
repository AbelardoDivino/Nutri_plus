export function Spinner() {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, color: 'var(--muted)' }}><span style={{ width: 18, height: 18, border: '3px solid var(--line)', borderTopColor: 'var(--green-700)', borderRadius: 999, display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /><span>Carregando…</span><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}
export function Skeleton({ h = 14, w = '100%' }) {
  return <div style={{ height: h, width: w, background: 'linear-gradient(90deg,#e2e8f0,#f1f5f9,#e2e8f0)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite', borderRadius: 8 }}><style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style></div>;
}
export function CardSkeleton() {
  return <div className="card" style={{ padding: 14 }}><Skeleton h={18} w="60%" /><div style={{ height: 8 }} /><Skeleton h={12} /><div style={{ height: 6 }} /><Skeleton h={12} w="80%" /></div>;
}
export function PageLoading({ text = 'Carregando dados...' }) {
  return <div className="container" style={{ padding: '24px 16px' }}><div className="card" style={{ padding: 24, textAlign: 'center' }}><Spinner /><p style={{ color: 'var(--muted)' }}>{text}</p></div></div>;
}
