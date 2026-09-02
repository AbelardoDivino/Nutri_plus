import { Link } from 'react-router-dom';
export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20, padding: '28px 16px' }}>
          <div>
            <span className="badge">Alimentação saudável e eficiente</span>
            <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.05, margin: '10px 0' }}>Novos Hábitos e Nova vida!</h1>
            <p style={{ color: 'var(--muted)', maxWidth: 560 }}>Agende hoje mesmo uma consulta com quem cria novos hábitos e transforma sua qualidade de vida. Plataforma para nutricionistas e personal trainers gerenciarem clientes com dieta e treino personalizados.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary">Agendar Consulta Agora →</Link>
              <Link to="/register-profissional" className="btn btn-ghost">Sou profissional</Link>
            </div>
            <div className="grid grid-3" style={{ marginTop: 18 }}>
              <div className="card kpi"><small style={{ color: 'var(--muted)' }}>Clientes</small><h3>+2.500</h3></div>
              <div className="card kpi"><small style={{ color: 'var(--muted)' }}>Dietas</small><h3>+12k</h3></div>
              <div className="card kpi"><small style={{ color: 'var(--muted)' }}>Avaliações</small><h3>IMC/TMB/TDEE</h3></div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}><img alt="" src="https://images.unsplash.com/photo-1512621776952-a57141f2eefd?w=120&h=120&fit=crop" loading="lazy" referrerPolicy="no-referrer" onError={e => e.currentTarget.style.display='none'} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} /><div><b>Ferro heme é melhor?</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>Entenda as diferenças e absorção</div></div></div>
            <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}><img alt="" src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=120&h=120&fit=crop" loading="lazy" referrerPolicy="no-referrer" onError={e => e.currentTarget.style.display='none'} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} /><div><b>Benefícios da vitamina D</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>Imunidade e saúde óssea</div></div></div>
            <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}><img alt="" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop" loading="lazy" referrerPolicy="no-referrer" onError={e => e.currentTarget.style.display='none'} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} /><div><b>Vale a pena multivitamínicos?</b><div style={{ color: 'var(--muted)', fontSize: 13 }}>Quando e como usar</div></div></div>
          </div>
        </div>
      </section>

      <section style={{ background: '#0b3d2e', color: '#fff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20, padding: '28px 16px', alignItems: 'center' }}>
          <img alt="consulta" src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=640&h=420&fit=crop" style={{ borderRadius: 14, width: '100%', objectFit: 'cover' }} />
          <div>
            <span className="badge" style={{ background: '#dcfce7', color: '#0b3d2e' }}>Começa aqui uma nova vida</span>
            <h2 style={{ margin: '8px 0' }}>Incluso na Consulta</h2>
            <p style={{ color: '#cbd5e1' }}>Atendimento clínico personalizado, promovendo uma alimentação equilibrada de acordo com a genética de cada paciente, baseado em cálculos, análises e exames para alcançar objetivos.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><Link to="/register" className="btn btn-primary">Agendar Consulta Agora →</Link><Link to="/dashboard" className="btn btn-ghost" style={{ color: '#0b3d2e' }}>Mais sobre mim →</Link></div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '22px 16px' }}>
        <div className="grid grid-4">
          {[
            ['Análise geral do objetivo, histórico clínico e alimentar', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop'],
            ['Detecção de possíveis deficiências de vitaminas', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop'],
            ['Verifica hipersensibilidade e intolerâncias', 'https://images.unsplash.com/photo-1512621776952-a57141f2eefd?w=300&h=200&fit=crop'],
            ['Avaliação de peso, altura e % gordura', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'],
            ['Definição de cálculos de TMB/TDEE', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop'],
            ['O paciente já sai com dieta para saber o que comprar', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=200&fit=crop'],
            ['Dieta individualizada no momento da consulta', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=200&fit=crop'],
            ['Acompanhamento e dúvidas pelo WhatsApp', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=200&fit=crop'],
          ].map(([t, img]) => (
            <div key={t} className="card" style={{ padding: 12, textAlign: 'center' }}>
              <img alt="" src={img} loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ borderRadius: 10, height: 120, width: '100%', objectFit: 'cover' }} />
              <p style={{ fontSize: 13, marginTop: 8, color: 'var(--muted)' }}>{t}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
