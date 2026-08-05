'use client';

import { useState } from 'react';

/* =============================================================
   CALCULADORA DE PONTO PERCENTUAL DE CONVERSAO

   Dossie Mestre §4.2 — substitui promessa de resultado.
   Todo numero exibido aqui e derivado aritmeticamente do que a
   propria clinica informa. A calculadora NAO estima ganho, NAO
   projeta melhoria e NAO usa benchmark de mercado. Ela responde
   uma unica pergunta verificavel:

       quanto vale um ponto percentual de conversao nesta clinica?

   Se alguem pedir para acrescentar "ganho esperado" ou
   "resultado medio", isso volta a ser afirmacao sem lastro.
   ============================================================= */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

type Campo = {
  chave: 'leads' | 'conversao' | 'ticket';
  rotulo: string;
  sufixo: string;
  min: number;
  max: number;
  passo: number;
};

const CAMPOS: Campo[] = [
  { chave: 'leads', rotulo: 'Leads que chegam por mês', sufixo: 'leads', min: 0, max: 5000, passo: 1 },
  { chave: 'conversao', rotulo: 'Quantos viram procedimento', sufixo: '%', min: 0, max: 100, passo: 0.5 },
  { chave: 'ticket', rotulo: 'Ticket médio do procedimento', sufixo: 'R$', min: 0, max: 500000, passo: 100 },
];

export default function Calculadora() {
  const [valores, setValores] = useState({ leads: 120, conversao: 18, ticket: 12000 });

  const preenchido = valores.leads > 0 && valores.ticket > 0;

  // Um ponto percentual de conversao, em pacientes por ano e em receita anual.
  const pacientesPorPonto = (valores.leads * 12) / 100;
  const valorPorPonto = pacientesPorPonto * valores.ticket;

  // Situacao atual, para dar escala ao numero acima.
  const pacientesHoje = (valores.leads * 12 * valores.conversao) / 100;
  const receitaHoje = pacientesHoje * valores.ticket;

  const set = (chave: Campo['chave'], bruto: string) => {
    const n = Number(bruto.replace(/[^\d.,]/g, '').replace(',', '.'));
    const campo = CAMPOS.find((c) => c.chave === chave)!;
    const seguro = Number.isFinite(n) ? Math.min(Math.max(n, campo.min), campo.max) : 0;
    setValores((v) => ({ ...v, [chave]: seguro }));
  };

  return (
    <div className="surface" style={{ padding: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 20 }}>
        {CAMPOS.map((c) => (
          <div key={c.chave}>
            <label className="label" style={{ display: 'block', marginBottom: 10 }}>
              {c.rotulo}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {c.sufixo === 'R$' && (
                <span className="cinzel" style={{ color: '#5A5248', fontSize: 13 }}>
                  R$
                </span>
              )}
              <input
                inputMode="decimal"
                value={valores[c.chave]}
                onChange={(e) => set(c.chave, e.target.value)}
                aria-label={c.rotulo}
              />
              {c.sufixo !== 'R$' && (
                <span className="cinzel" style={{ color: '#5A5248', fontSize: 12 }}>
                  {c.sufixo}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1F1A15', marginTop: 30, paddingTop: 28 }}>
        {preenchido ? (
          <>
            <div className="label" style={{ marginBottom: 12 }}>
              Cada ponto percentual de conversão vale
            </div>
            <div
              className="cinzel"
              style={{
                fontSize: 'clamp(34px, 7vw, 52px)',
                color: '#D4A853',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 8,
              }}
            >
              {BRL.format(valorPorPonto)}
              <span style={{ fontSize: 18, color: '#998E82', letterSpacing: 2 }}> / ANO</span>
            </div>
            <div style={{ color: '#998E82', fontSize: 17, lineHeight: 1.8 }}>
              São{' '}
              <em>
                {pacientesPorPonto.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pacientes
                por ano
              </em>{' '}
              que hoje entram em contato e não seguem adiante. Sobre a sua base
              atual de {Math.round(pacientesHoje).toLocaleString('pt-BR')} procedimentos
              anuais ({BRL.format(receitaHoje)}).
            </div>
            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: '1px solid #1F1A15',
                color: '#5A5248',
                fontSize: 14,
                lineHeight: 1.75,
              }}
            >
              Aritmética simples sobre os números que você informou. Não é
              projeção de ganho nem promessa de resultado — é a medida do que
              está em disputa no primeiro contato.
            </div>
          </>
        ) : (
          <div style={{ color: '#5A5248', fontSize: 16 }}>
            Informe o volume de leads e o ticket médio para ver o cálculo.
          </div>
        )}
      </div>
    </div>
  );
}
