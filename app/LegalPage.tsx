import type { ReactNode } from 'react';

/* =============================================================
   Layout compartilhado das paginas juridicas (/privacidade, /termos).

   O componente <Pendente> marca visualmente o que ainda depende do
   parecer juridico. E deliberadamente visivel: um placeholder
   invisivel vira, com o tempo, uma politica publicada pela metade.
   ============================================================= */

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        className="cinzel"
        style={{ fontSize: 15, letterSpacing: 2, color: '#F0EDE8', marginBottom: 14, fontWeight: 600 }}
      >
        {titulo}
      </h2>
      <div className="legal-body">{children}</div>
    </section>
  );
}

export function Pendente({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        borderLeft: '2px solid #B87333',
        background: '#0A0A0A',
        padding: '14px 18px',
        margin: '18px 0',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <div className="label-copper" style={{ marginBottom: 8, letterSpacing: 3 }}>
        Aguardando parecer jurídico
      </div>
      <div style={{ color: '#998E82', fontSize: 16, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function LegalPage({
  rotulo,
  titulo,
  atualizacao,
  children,
}: {
  rotulo: string;
  titulo: string;
  atualizacao: string;
  children: ReactNode;
}) {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 90px' }} className="fade">
        <div className="label-copper" style={{ marginBottom: 16 }}>
          {rotulo}
        </div>
        <h1 className="cinzel" style={{ fontSize: 32, letterSpacing: 2, color: '#F0EDE8', marginBottom: 10 }}>
          {titulo}
        </h1>
        <div style={{ color: '#5A5248', fontSize: 15, marginBottom: 14 }}>{atualizacao}</div>
        <div style={{ width: 60, height: 1, background: '#B87333', marginBottom: 44 }} />

        <div
          style={{
            background: '#0A0A0A',
            border: '1px solid #1F1A15',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 44,
            color: '#998E82',
            fontSize: 15,
            lineHeight: 1.75,
          }}
        >
          Este documento está em versão estruturada. As seções marcadas como
          <em> aguardando parecer jurídico</em> serão preenchidas pela assessoria
          jurídica antes da primeira contratação comercial.
        </div>

        {children}
      </div>
      {/* Espacamento e ritmo de leitura do corpo juridico. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .legal-body p { color:#998E82; font-size:17px; line-height:1.85; margin-bottom:16px; }
            .legal-body ul { margin:0 0 16px 20px; }
            .legal-body li { color:#998E82; font-size:17px; line-height:1.85; margin-bottom:10px; }
            .legal-body strong { color:#F0EDE8; font-weight:400; }
          `,
        }}
      />
    </main>
  );
}
