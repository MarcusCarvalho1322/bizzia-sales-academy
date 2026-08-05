# BIZZ.IA Sales Academy

Plataforma de capacitação em atendimento consultivo para equipes de recepção
de clínicas de estética e cirurgia plástica.

- **205 questões** em 4 níveis de certificação, com gabarito comentado
- **12 perfis de paciente** para simulação conversacional com IA
- **Painel de gestor** com desempenho por pessoa e por competência

---

## Comece por aqui

| Se você é… | Leia |
|---|---|
| Marcus, ou qualquer pessoa retomando o projeto | [`docs/DOSSIE-MESTRE.md`](docs/DOSSIE-MESTRE.md) — fonte única de verdade |
| Um agente de execução (Claude Code) | `docs/DOSSIE-MESTRE.md` §4 a §8 |
| Responsável por compliance ou jurídico | [`docs/RELATORIO-COMPLIANCE.md`](docs/RELATORIO-COMPLIANCE.md) e o Anexo A do dossiê |

> O dossiê existe dentro do repositório de propósito. O projeto já foi
> abandonado duas vezes no mesmo ponto — a última milha de publicação — porque
> o histórico se perdia entre sessões. Qualquer sessão futura retoma por ali,
> sem reconstituir nada.

---

## Stack

```
Frontend     Next.js 14 (App Router) + React 18
Hospedagem   Vercel
Banco        Neon (PostgreSQL) + RLS   — ainda não provisionado
Auth         NextAuth.js               — credenciais de demonstração
IA           Claude API via route handler server-side
```

## Estrutura

```
app/
  layout.tsx              metadata e fonts
  globals.css             design system (§5 do dossiê)
  page.tsx                landing
  Calculadora.tsx         calculadora com os números do cliente (§4.2)
  LegalPage.tsx           layout das páginas jurídicas
  academy/
    page.tsx              entrada
    SalesAcademy.jsx      aplicação unificada v5
  privacidade/page.tsx    LGPD — estrutura, conteúdo jurídico pendente
  termos/page.tsx         LGPD — estrutura, conteúdo jurídico pendente
  api/
    simulate/route.ts     proxy seguro da Claude API + rate limiting
    auth/[...nextauth]/   autenticação
lib/
  questions.js            205 questões
  patient-profiles.js     12 perfis de paciente
  material.js             material complementar por nível
  courses.js              níveis, competências, contas de demonstração
  ai-evaluation-engine.js prompts e rubricas de avaliação
  auth.ts                 configuração do NextAuth
prisma/schema.prisma      schema de dados (banco não provisionado)
docs/                     dossiê, relatório de compliance, schema Neon, n8n
```

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY para a simulação
npm run dev
```

Sem `ANTHROPIC_API_KEY`, tudo funciona exceto o módulo de simulação, que
responde com uma mensagem explicando que a chave não está configurada.

### Contas de demonstração

| E-mail | Senha | Perfil |
|---|---|---|
| `demo@bizzia.com` | `demo123` | Aluna, plano Pro |
| `juliana@clinica.com` | `juliana123` | Aluna, plano Essencial |
| `gestor@clinica.com` | `gestor123` | Gestora |

São contas em memória, definidas em `lib/courses.js`. Serão substituídas por
autenticação real contra o banco quando o Neon for provisionado.

## Variáveis de ambiente

Todas descritas em [`.env.example`](.env.example). Em produção, cadastre em
**Vercel → Settings → Environment Variables**.

| Variável | Obrigatória | Para quê |
|---|---|---|
| `ANTHROPIC_API_KEY` | para a simulação | Claude API — **somente server-side** |
| `NEXTAUTH_SECRET` | sim | assinatura da sessão |
| `NEXTAUTH_URL` | sim | URL pública |
| `DATABASE_URL` | ainda não | Neon, quando provisionado |
| `ANTHROPIC_MODEL` | não | sobrescreve o modelo padrão |
| `RATE_LIMIT_PER_MINUTE` | não | padrão: 10 |

---

## Regras que não se negociam

1. **A `ANTHROPIC_API_KEY` nunca vai para o cliente.** Toda chamada à IA passa
   por `app/api/simulate/route.ts`. Se algum dia aparecer um `fetch` para
   `api.anthropic.com` em código de cliente, é um incidente de segurança.
2. **Nenhuma afirmação de resultado sem fonte citada.** Nada de "+40% de
   conversão". Se precisar mostrar valor, use a calculadora com os números do
   próprio cliente. Ver `docs/RELATORIO-COMPLIANCE.md` §2.
3. **Nenhum registro profissional inventado.** Sem número de CRM, sem
   credencial verificável atribuída a persona fictícia.
4. **As 205 questões e os 12 perfis não se reescrevem.** São o ativo mais
   defensável do produto.
5. **Design system sem desvio.** Fundo `#000000`, Cinzel e Cormorant Garamond
   peso 300, cobre em no máximo 3 pontos por tela, sem emoji na interface.
   Especificação em `app/globals.css` e no dossiê §5.
