import type { Metadata } from 'next';
import Link from 'next/link';
import Calculadora from './Calculadora';

export const metadata: Metadata = {
  title: 'BIZZ.IA Sales Academy',
  description:
    'Capacitacao em atendimento consultivo para equipes de recepcao de clinicas de estetica e cirurgia plastica.',
};

/* =============================================================
   LANDING PAGE

   CONFORMIDADE — Dossie Mestre §4.1 e §4.2.
   Esta pagina nao contem nenhuma afirmacao de resultado.
   Em vez de prometer conversao, ticket ou LTV, ela instrumenta
   o calculo com os numeros do proprio cliente (componente
   Calculadora). Qualquer numero adicionado aqui no futuro
   precisa de fonte citavel — ver docs/RELATORIO-COMPLIANCE.md.
   ============================================================= */

const CERTIFICACOES = [
  { nivel: 'I', titulo: 'FUNDAMENTOS', desc: 'Atendimento e primeiros contatos' },
  { nivel: 'II', titulo: 'HIGH TICKET', desc: 'Procedimentos de alto valor' },
  { nivel: 'III', titulo: 'PREMIUM', desc: 'Cliente VIP e ticket máximo' },
  { nivel: 'IV', titulo: 'LTV MASTER', desc: 'Carteira vitalícia e referências' },
];

const MODULOS = [
  {
    rotulo: 'MÓDULO DE EXAMES',
    titulo: 'Cenários com ambiguidade real',
    texto:
      'Duzentas e cinco questões construídas sobre situações que acontecem na recepção. Em cada uma, mais de uma alternativa parece defensável — a diferença está no detalhe que separa atendimento competente de atendimento excepcional. Gabarito comentado e material de aprofundamento ao final de cada nível.',
  },
  {
    rotulo: 'MÓDULO DE SIMULAÇÃO',
    titulo: 'Doze pacientes que resistem',
    texto:
      'Conversas com pacientes virtuais que hesitam, comparam preços, se constrangem e testam a escuta de quem atende. A avaliação acontece turno a turno, por competência, com transcrição comentada ao final. Todas as personas são fictícias e existem apenas para treinamento.',
  },
  {
    rotulo: 'PAINEL DE GESTÃO',
    titulo: 'Evolução visível por pessoa',
    texto:
      'A proprietária acompanha o desempenho de cada colaboradora por nível e por competência, identifica onde a equipe trava e mede a evolução ao longo do tempo. Certificação com número de série e página pública de validação.',
  },
];

export default function Home() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      {/* ── Abertura ─────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '110px 24px 90px',
          textAlign: 'center',
        }}
        className="fade"
      >
        <div className="label-copper" style={{ marginBottom: 22 }}>
          BIZZ.IA
        </div>
        <h1
          className="cinzel"
          style={{ fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: 4, color: '#F0EDE8', marginBottom: 8 }}
        >
          SALES ACADEMY
        </h1>
        <div style={{ width: 60, height: 1, background: '#B87333', margin: '26px auto' }} />
        <p
          style={{
            fontSize: 'clamp(17px, 2.4vw, 22px)',
            color: '#998E82',
            lineHeight: 1.75,
            maxWidth: 620,
            margin: '0 auto 44px',
          }}
        >
          Capacitação em atendimento consultivo para as equipes de recepção de
          clínicas de estética e cirurgia plástica.
        </p>
        <Link
          href="/academy"
          className="cinzel"
          style={{
            display: 'inline-block',
            padding: '15px 42px',
            background: 'linear-gradient(135deg,#B87333,#D4A853)',
            color: '#000',
            borderRadius: 8,
            fontSize: 12,
            letterSpacing: 3,
            fontWeight: 700,
            border: 'none',
          }}
        >
          ACESSAR A PLATAFORMA
        </Link>
      </section>

      {/* ── Certificações ────────────────────────────────────── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 90px' }}>
        <div className="label" style={{ textAlign: 'center', marginBottom: 34 }}>
          Quatro certificações
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
            gap: 18,
          }}
        >
          {CERTIFICACOES.map((c) => (
            <div key={c.nivel} className="surface" style={{ padding: 30 }}>
              <div className="cinzel" style={{ fontSize: 26, color: '#B87333', marginBottom: 14 }}>
                {c.nivel}
              </div>
              <div
                className="cinzel"
                style={{ fontSize: 13, color: '#F0EDE8', letterSpacing: 2, marginBottom: 8 }}
              >
                {c.titulo}
              </div>
              <div style={{ color: '#998E82', fontSize: 15, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Módulos ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 90px' }}>
        {MODULOS.map((m, i) => (
          <div
            key={m.rotulo}
            style={{
              paddingBottom: 44,
              marginBottom: 44,
              borderBottom: i < MODULOS.length - 1 ? '1px solid #1F1A15' : 'none',
            }}
          >
            <div className="label-copper" style={{ marginBottom: 14 }}>
              {m.rotulo}
            </div>
            <h2 style={{ fontSize: 26, color: '#F0EDE8', marginBottom: 16, fontWeight: 400 }}>
              {m.titulo}
            </h2>
            <p style={{ fontSize: 18, color: '#998E82', lineHeight: 1.85 }}>{m.texto}</p>
          </div>
        ))}
      </section>

      {/* ── Calculadora — substitui promessa de resultado (§4.2) ─ */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 90px' }}>
        <div className="label-copper" style={{ marginBottom: 14 }}>
          O QUE ESTÁ EM JOGO NA SUA CLÍNICA
        </div>
        <h2 style={{ fontSize: 26, color: '#F0EDE8', marginBottom: 16, fontWeight: 400 }}>
          Calcule com os seus próprios números
        </h2>
        <p style={{ fontSize: 18, color: '#998E82', lineHeight: 1.85, marginBottom: 32 }}>
          Não prometemos um percentual de melhoria — não teríamos como comprovar.
          O que dá para medir é quanto vale, na sua operação, cada ponto
          percentual de conversão que hoje se perde no primeiro contato.
        </p>
        <Calculadora />
      </section>

      {/* ── Metodologia ──────────────────────────────────────── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 90px' }}>
        <div className="label-copper" style={{ marginBottom: 14 }}>
          ORIGEM DO CONTEÚDO
        </div>
        <p style={{ fontSize: 18, color: '#998E82', lineHeight: 1.85 }}>
          Construído sobre a metodologia RAP — Recepção de Alta Performance —
          desenvolvida na formação de profissionais de clínica. O conteúdo cobre
          rapport, descoberta de necessidade, apresentação de valor, manejo de
          objeção, ética, discrição e gestão de relacionamento de longo prazo.
        </p>
      </section>

      {/* ── Rodapé ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #1F1A15', padding: '36px 24px 56px' }}>
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div className="cinzel" style={{ fontSize: 10, letterSpacing: 4, color: '#5A5248' }}>
            BIZZ.IA SALES ACADEMY
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/privacidade" style={{ fontSize: 15, color: '#5A5248' }}>
              Política de Privacidade
            </Link>
            <Link href="/termos" style={{ fontSize: 15, color: '#5A5248' }}>
              Termos de Uso
            </Link>
          </div>
        </div>
        <div
          style={{
            maxWidth: 760,
            margin: '20px auto 0',
            color: '#5A5248',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Plataforma de capacitação profissional destinada a equipes de clínicas.
          Não se dirige a pacientes nem ao público geral. Todos os cenários e
          personas de treinamento são fictícios.
        </div>
      </footer>
    </main>
  );
}
