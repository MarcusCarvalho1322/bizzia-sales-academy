/* =============================================================
   PROXY SEGURO PARA A CLAUDE API
   Dossie Mestre §6.3 — requisito de seguranca obrigatorio.

   A ANTHROPIC_API_KEY existe SOMENTE aqui, no servidor.
   O componente React chama /api/simulate e nunca api.anthropic.com.
   Nenhum dado pessoal de paciente real trafega por esta rota:
   apenas personas ficticias de treinamento e respostas da aluna.
   ============================================================= */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1000;
const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 4000;
const WINDOW_MS = 60_000;

/* ── RATE LIMITING POR USUARIO ──────────────────────────────
   Contencao de custo e abuso (Dossie §6.3, §11).
   Implementacao em memoria: efetiva por instancia serverless.
   Quando o Neon estiver provisionado, migrar o contador para o
   banco (ou Vercel KV) para que o limite valhaentre instancias.
   ─────────────────────────────────────────────────────────── */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function limitPerMinute(): number {
  const raw = Number(process.env.RATE_LIMIT_PER_MINUTE);
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

function identify(req: NextRequest): string {
  // Identidade do usuario autenticado quando disponivel; IP como fallback.
  const user = req.headers.get('x-academy-user');
  if (user) return `u:${user.slice(0, 120)}`;
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : 'desconhecido';
  return `ip:${ip}`;
}

function rateLimit(key: string): { ok: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const limit = limitPerMinute();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000), remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0, remaining: limit - bucket.count };
}

// Descarta buckets vencidos para a memoria nao crescer indefinidamente.
function sweep() {
  if (buckets.size < 500) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/* ── VALIDACAO DE ENTRADA ──────────────────────────────────── */

type Message = { role: 'user' | 'assistant'; content: string };

function validate(body: unknown): { messages: Message[]; systemPrompt: string } | string {
  if (typeof body !== 'object' || body === null) return 'Corpo da requisicao invalido.';
  const { messages, systemPrompt } = body as Record<string, unknown>;

  if (typeof systemPrompt !== 'string' || systemPrompt.length === 0) {
    return 'systemPrompt ausente.';
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages ausente ou vazio.';
  }
  if (messages.length > MAX_MESSAGES) {
    return 'Conversa longa demais para uma sessao de simulacao.';
  }

  const clean: Message[] = [];
  for (const m of messages) {
    if (typeof m !== 'object' || m === null) return 'Mensagem malformada.';
    const { role, content } = m as Record<string, unknown>;
    if (role !== 'user' && role !== 'assistant') return 'Papel de mensagem invalido.';
    if (typeof content !== 'string' || content.length === 0) return 'Conteudo de mensagem invalido.';
    clean.push({ role, content: content.slice(0, MAX_CHARS_PER_MESSAGE) });
  }

  return { messages: clean, systemPrompt: systemPrompt.slice(0, 12_000) };
}

/* ── HANDLER ───────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Modulo de simulacao indisponivel: ANTHROPIC_API_KEY nao configurada no servidor.' },
      { status: 503 },
    );
  }

  sweep();
  const key = identify(req);
  const gate = rateLimit(key);
  if (!gate.ok) {
    return NextResponse.json(
      { error: `Limite de ${limitPerMinute()} simulacoes por minuto atingido. Tente novamente em ${gate.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(gate.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalido.' }, { status: 400 });
  }

  const parsed = validate(body);
  if (typeof parsed === 'string') {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: parsed.systemPrompt,
        messages: parsed.messages,
      }),
    });

    if (!upstream.ok) {
      // Nunca repassar o corpo bruto do erro: pode conter detalhe de infraestrutura.
      const detail = await upstream.text().catch(() => '');
      console.error('[simulate] upstream %s: %s', upstream.status, detail.slice(0, 500));
      const status = upstream.status === 429 ? 429 : 502;
      return NextResponse.json(
        {
          error:
            status === 429
              ? 'A IA esta com alto volume de requisicoes. Aguarde alguns segundos.'
              : 'Falha ao consultar a IA. Tente novamente.',
        },
        { status },
      );
    }

    const data = (await upstream.json()) as { content?: Array<{ text?: string }> };
    return NextResponse.json(
      { text: data.content?.[0]?.text ?? '' },
      { headers: { 'X-RateLimit-Remaining': String(gate.remaining) } },
    );
  } catch (err) {
    console.error('[simulate] erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno ao processar a simulacao.' }, { status: 500 });
  }
}
