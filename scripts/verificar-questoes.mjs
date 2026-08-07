/* =============================================================
   VERIFICADOR DE VALIDADE DO BANCO DE QUESTOES

   Rode com:  npm run verificar-questoes

   Existe por um motivo concreto: na versao original, a alternativa
   correta era a mais longa em 204 das 205 questoes. Quem percebia o
   padrao gabaritava sem ler uma linha do enunciado. O exame nao media
   competencia — media quem notou o truque.

   Este script falha o processo (exit 1) se qualquer heuristica de
   superficie voltar a permitir aprovacao sem leitura.
   ============================================================= */

import { QB } from '../lib/questions.js';

const APROVACAO_MINIMA = 70; // menor nota de corte entre os 4 niveis
const TETO_HEURISTICA = 45; // nenhuma heuristica pode passar disso
const ACASO = 25;

const questoes = [];
for (const [nivel, qs] of Object.entries(QB)) qs.forEach((q, i) => questoes.push({ nivel: +nivel, i, q }));

const N = questoes.length;
const pct = (x) => (x / N) * 100;
const fmt = (x) => pct(x).toFixed(1).padStart(5) + '%';

/* ── Heuristicas que um aluno esperto tentaria ────────────── */
const heuristicas = {
  'sempre a mais longa': ({ q }) => {
    const l = q.o.map((o) => o.length);
    return l[q.c] === Math.max(...l);
  },
  'sempre a mais curta': ({ q }) => {
    const l = q.o.map((o) => o.length);
    return l[q.c] === Math.min(...l);
  },
  'sempre a primeira': ({ q }) => q.c === 0,
  'sempre a ultima': ({ q }) => q.c === q.o.length - 1,
  'a que tem mais virgulas': ({ q }) => {
    const v = q.o.map((o) => (o.match(/,/g) || []).length);
    return v[q.c] === Math.max(...v);
  },
  'a unica com aspas': ({ q }) => {
    const comAspas = q.o.map((o) => /['"‘’“”]/.test(o));
    return comAspas.filter(Boolean).length === 1 && comAspas[q.c];
  },
};

console.log(`\nBANCO: ${N} questoes\n`);
console.log('HEURISTICAS DE SUPERFICIE (acaso = 25%, teto aceito = 45%)');

let reprovou = false;
for (const [nome, fn] of Object.entries(heuristicas)) {
  const acertos = questoes.filter(fn).length;
  const p = pct(acertos);
  const ok = p <= TETO_HEURISTICA;
  if (!ok) reprovou = true;
  console.log(`  ${ok ? 'OK  ' : 'FALHA'} ${fmt(acertos)}  ${nome}`);
}

/* ── Densidade das alternativas ───────────────────────────── */
let somaCerta = 0, somaErrada = 0, nErr = 0;
for (const { q } of questoes) {
  somaCerta += q.o[q.c].length;
  q.o.forEach((o, i) => { if (i !== q.c) { somaErrada += o.length; nErr++; } });
}
const razao = somaCerta / N / (somaErrada / nErr);
console.log(`\nDENSIDADE  correta ${(somaCerta / N).toFixed(0)} car  x  erradas ${(somaErrada / nErr).toFixed(0)} car  = ${razao.toFixed(2)}x`);
if (razao < 0.8 || razao > 1.25) {
  console.log('  FALHA: a razao precisa ficar entre 0.80x e 1.25x.');
  reprovou = true;
} else {
  console.log('  OK');
}

/* ── Sanidade estrutural ──────────────────────────────────── */
const problemas = [];
for (const { nivel, i, q } of questoes) {
  if (!q.q || !q.f || !q.k) problemas.push(`${nivel}.${i}: campo obrigatorio vazio`);
  if (q.o.length !== 4) problemas.push(`${nivel}.${i}: ${q.o.length} alternativas (esperado 4)`);
  if (q.c < 0 || q.c >= q.o.length) problemas.push(`${nivel}.${i}: gabarito fora do intervalo`);
  if (new Set(q.o).size !== q.o.length) problemas.push(`${nivel}.${i}: alternativas duplicadas`);
  if (q.o.some((o) => !o || o.length < 20)) problemas.push(`${nivel}.${i}: alternativa curta demais`);
}
console.log(`\nESTRUTURA  ${problemas.length === 0 ? 'OK' : 'FALHA'}`);
problemas.forEach((p) => console.log('  ' + p));
if (problemas.length) reprovou = true;

/* ── Contagem de ativos ───────────────────────────────────── */
console.log(`\nATIVOS`);
const porNivel = Object.entries(QB).map(([n, qs]) => `nivel ${n}: ${qs.length}`).join('  |  ');
console.log(`  ${porNivel}  |  total: ${N}`);
if (N !== 205) { console.log('  FALHA: o banco deve ter 205 questoes.'); reprovou = true; }

/* ── Veredito ─────────────────────────────────────────────── */
console.log('');
if (reprovou) {
  console.error('REPROVADO: o banco permite aprovacao sem leitura, ou tem defeito estrutural.');
  console.error(`Nota de corte do exame: ${APROVACAO_MINIMA}%. Nenhuma heuristica pode chegar perto disso.\n`);
  process.exit(1);
}
console.log('APROVADO: nenhuma heuristica de superficie se aproxima da nota de corte.\n');
