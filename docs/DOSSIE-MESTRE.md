# BIZZ.IA SALES ACADEMY
## Dossiê Mestre de Execução — v6.0

**Documento único de retomada, correção e go-live**
Emitido em 05 de agosto de 2026
Responsável do projeto: Marcus Cardoso Carvalho — BIZZ.IA Intelligence Ecosystem
Validação jurídica obrigatória: Dra. Emmanuelle Moura da Silva — OAB/SP 528.742

---

## 0. Como usar este documento

Este dossiê é a **fonte única de verdade** do projeto. Ele substitui todos os planos, auditorias e roteiros anteriores. Foi escrito para ser lido por três públicos distintos:

| Público | Seções relevantes |
|---|---|
| Marcus (decisão e acompanhamento) | 1, 2, 3, 9, 10, 11 |
| Agente de execução em Claude Code | 4, 5, 6, 7, 8 |
| Dra. Emmanuelle (validação jurídica) | Anexo A |

Qualquer sessão futura de Claude — em chat, Code ou Cowork — deve receber este documento como contexto inicial. Ele elimina a necessidade de reconstituir histórico.

---

## 1. Situação verificada

### 1.1 Evidência técnica coletada em 05/08/2026

Consulta direta à API do Vercel, projeto `bizzia-sales-academy`:

```
id:              prj_1FZ7hWoV9ZPrmCvaiBynluxJJTtU
team:            team_31fbLenXvEORvF1m9V7CFiqv
framework:       null
live:            false
último deploy:   07/04/2026 (dpl_4JSjw2TtXEFy3V2xDAEC4MeYbbKd)
readyState:      READY
domínio:         bizzia-sales-academy.vercel.app
```

**Leitura dos três indicadores:**

- `framework: null` — o Vercel não identifica um projeto Next.js no repositório conectado. Confirma que o conteúdo em produção não é a aplicação Sales Academy.
- `live: false` — o projeto não está servindo tráfego produtivo.
- Último deploy em **07/04/2026** — **120 dias de inatividade**.

### 1.2 Diagnóstico

O projeto **não está bloqueado por produto**. Está bloqueado pela última milha de publicação.

A causa raiz é estrutural, não técnica: todas as sessões anteriores terminaram com instruções de linha de comando (git init, git add, git push) entregues a um operador que declarou explicitamente não ser desenvolvedor. O handoff falhou de forma reprodutível por quatro meses.

**A correção não é insistir no mesmo handoff. É mudar o ambiente de execução** — de chat (que só gera arquivos) para Claude Code (que opera o sistema de arquivos e o git diretamente na máquina).

---

## 2. Inventário de ativos existentes

Tudo abaixo já foi produzido e entregue em sessões anteriores. Nada disso deve ser reconstruído.

### 2.1 Produto

| Ativo | Descrição | Estado |
|---|---|---|
| `SalesAcademy_v3_Sprint3.jsx` | 205 questões com ambiguidade genuína em todas as alternativas; `shuffleOptions` para randomização de posição de gabarito | Completo |
| `SalesAcademy_v4_Sprint4.jsx` | Módulo de simulação conversacional. 12 perfis de paciente. Claude API em duplo papel: paciente virtual + avaliador. 6 turnos. Rubrica por competência. Transcrição comentada. | Completo |
| `SalesAcademy_v5_unified.jsx` | Aplicação unificada: exames + simulação + painel de gestor. Planos Essencial e Pro. | Completo |

### 2.2 Infraestrutura

| Ativo | Descrição | Estado |
|---|---|---|
| `schema-neon.sql` | 12 tabelas, Row Level Security, multi-tenancy por `org_id` | Entregue, **não provisionado** |
| `ai-evaluation-engine.js` | Prompts e rubricas de avaliação Claude API | Entregue |
| `n8n-workflow.json` | Workflow de avaliação e rotação mensal de questões | Entregue, **não deployado** |
| `nextauth-config.js` | Configuração de autenticação | Entregue, **não implementado** |

### 2.3 Go-to-market

| Ativo | Estado | Ação requerida |
|---|---|---|
| Modelo comercial — 3 planos + calculadora de ROI | Entregue | **Correção de compliance (§4)** |
| Deck de vendas PPTX — 11 slides | Entregue | **Correção de compliance (§4)** |
| Landing page HTML premium | Entregue | **Correção de compliance (§4)** |

### 2.4 Os 12 perfis de paciente (ativo mais defensável do produto)

Este é o diferencial competitivo real. Nenhum concorrente brasileiro tem equivalente.

**Nível 1 — Fundamentos**
- Camila Ferreira, 27 — Rinoplastia. Ansiosa, tímida, medo de resultado artificial. *(Iniciante)*
- Roberto Alves, 44 — Harmonização. Executivo constrangido, precisa de discrição. *(Intermediário)*
- Fátima Santos, 51 — Blefaroplastia. Comparadora de preços, já ligou em 3 clínicas. *(Desafiador)*

**Nível 2 — High Ticket**
- Cristiane Melo, 41 — Mommy Makeover. CEO com 15 minutos, não aceita protocolo padrão. *(Intermediário)*
- Patrícia Dias, 38 — Rinoplastia + Mentoplastia. Advogada com opiniões médicas contraditórias. *(Desafiador)*
- Marcos Henrique, 47 — Ginecomastia. Primeira ligação, vergonha real. *(Desafiador)*

**Nível 3 — Premium**
- Helena Drummond, 53 — Lifting. Desembargadora, exige sigilo operacional real. *(Avançado)*
- Viviane Carvalho, 46 — Revisão cirúrgica. Resultado anterior ruim, fragilidade emocional. *(Avançado)*
- Ana Beatriz Lopes, 35 — Lipo HD. Influenciadora cética, já saiu de 3 clínicas. *(Intermediário)*

**Nível 4 — LTV Master**
- Renata Vasconcellos, 49 — Reativação após 14 meses. VIP que sumiu após resultado "apenas ok". *(Master)*
- Cláudia Mendonça, 44 — Indicação da filha. Dilema ético: desejo da filha ou dela? *(Master)*
- Suzana Moretti, 57 — 8 anos de casa, avaliando migrar para concorrente. *(Master)*

---

## 3. Ativos a descartar

| Item | Motivo |
|---|---|
| Artefatos produzidos na sessão de 05/08/2026 (7 arquivos React) | Duplicação inferior do que já existe nas v3/v4/v5. Sem valor incremental. |
| Estrutura de "24 módulos" | Escopo morto, substituído pela arquitetura de 4 certificações. |
| Menção a "certificados em blockchain" | Jargão sem função verificável. Substituído por número de série + página pública de validação (§6.5). |

---

## 4. Correções obrigatórias de compliance — P0

**Nenhuma apresentação comercial pode ocorrer antes destas correções.** Elas são bloqueadores absolutos, não sugestões.

### 4.1 Remoção de dados fabricados

Os seguintes números aparecem em materiais comerciais e **não possuem qualquer fonte**:

| Afirmação a remover | Onde aparece | Natureza |
|---|---|---|
| "+40% de conversão em 90 dias" | Deck, landing page, dashboard | Fabricada |
| "Aumento médio de ticket em 35%" | Deck, landing page | Fabricada |
| "Redução de 60% em objeções não superadas" | Landing page | Fabricada |
| "LTV médio 3x maior" | Deck | Fabricada |
| "Baseado em +1.000 atendimentos reais de clínicas premium brasileiras" | Landing page, dashboard | Fabricada |

Afirmação de resultado sem lastro em material comercial configura risco sob o Código de Defesa do Consumidor (art. 37 — publicidade enganosa) e compromete a credibilidade da marca no primeiro questionamento de um cliente sofisticado.

### 4.2 Texto substituto — mantém força comercial sem inventar dado

Em vez de prometer resultado, **instrumente o cálculo com os números do próprio cliente**. Isso é mais persuasivo e é verificável.

> **Substituir:** "Clínicas que usam o Sales Academy aumentam a conversão em 40%."
>
> **Por:** "Sua clínica recebe X leads por mês e converte Y%. Cada ponto percentual de conversão recuperado vale R$ Z ao ano. Calcule com os seus próprios números."

> **Substituir:** "Baseado em mais de 1.000 atendimentos reais."
>
> **Por:** "Construído sobre a metodologia RAP — Recepção de Alta Performance — desenvolvida ao longo de mais de uma década de formação de profissionais de clínica."

*Nota: a afirmação sobre a metodologia RAP e o histórico de formação deve ser calibrada por Marcus para refletir números que ele possa comprovar documentalmente. O dossiê registra o formato correto, não o número.*

> **Substituir:** qualquer benchmark de mercado sem fonte.
>
> **Por:** dado próprio, anonimizado e consentido, extraído das clínicas atendidas pela BIZZ.IA — ou dado público citável (ISAPS Global Survey, censo SBCP), com referência explícita.

### 4.3 Médico fictício com registro plausível

**Problema:** o personagem "Dr. Eduardo Cardoso — CRM 98765-SP, Fellowship Harvard" circula nos cenários de treinamento. CRM é registro público real; um número inventado pode corresponder a um profissional existente, criando risco de uso indevido de identidade profissional.

**Duas soluções aceitáveis, escolher uma:**

- **(a) Cirurgião parceiro real** — nome e credenciais verdadeiros, mediante autorização escrita de uso de imagem e nome para fins de treinamento. Ganho: credibilidade real.
- **(b) Persona explicitamente fictícia** — nome genérico ("Dr. [Cirurgião Responsável]"), **sem número de CRM**, com aviso visível: *"Cenário de treinamento. Profissional fictício."*

Recomendação: **(b) para o produto padrão**, **(a) como upgrade** quando houver clínica parceira que queira personalizar o treinamento com o próprio corpo clínico — isso vira funcionalidade vendável.

### 4.4 Preços de procedimento

Todos os valores presentes nos cenários (R$ 7.200, R$ 22.500, R$ 32.000 etc.) foram estimados sem fonte.

**Correção:** substituir por faixas extraídas das tabelas reais das clínicas já atendidas pela BIZZ.IA — Sucupira, Schmitt, Marbelli, Face & Fios — anonimizadas e com consentimento. Isso é ativo proprietário e mais defensável que qualquer média de mercado.

**Alternativa provisória**, caso os dados reais não estejam disponíveis a tempo: exibir faixas com rótulo explícito *"valor ilustrativo para fins de treinamento"* e permitir que a clínica contratante configure a própria tabela no painel de gestor — o que também é funcionalidade vendável.

### 4.5 LGPD — requisitos mínimos para go-live

| Requisito | Descrição |
|---|---|
| Base legal | Definir base para tratamento de dados de alunos (execução de contrato com a clínica contratante). |
| Política de privacidade | Publicada e aceita no primeiro acesso. |
| Termo de uso | Aceite registrado com timestamp. |
| Retenção | Definir prazo de retenção de transcrições de simulação. Recomendação: 12 meses, com opção de exclusão antecipada pela clínica. |
| Transcrições de simulação | São dados de desempenho profissional. Definir quem acessa: apenas a aluna e o gestor da clínica. |
| Encarregado (DPO) | Indicar. |
| Subprocessadores | Declarar Anthropic (Claude API), Neon, Vercel na política. |
| Chamadas à Claude API | Nenhum dado pessoal de paciente real deve trafegar. Apenas personas fictícias e respostas da aluna. |

### 4.6 Regulação médica — pontos a validar com a Dra. Emmanuelle

Ver **Anexo A** para o briefing completo.

---

## 5. Design System BIZZ.IA — especificação normativa

O agente de execução deve aplicar estes tokens sem desvio.

### 5.1 Paleta

```css
:root {
  /* Base */
  --black:        #000000;   /* fundo absoluto, sem exceção */
  --surface:      #0A0A0A;   /* elevação sutil */
  --surface-2:    #111111;   /* inputs, cards */

  /* Cobre — usar com parcimônia extrema */
  --copper:       #B87333;   /* acento principal */
  --copper-light: #D4985A;   /* hover, estado ativo */
  --gold:         #D4A853;   /* destaque de score, certificado */

  /* Tipografia */
  --text:         #F0EDE8;   /* texto primário */
  --text-muted:   #998E82;   /* secundário */
  --text-dim:     #5A5248;   /* terciário, hints */

  /* Bordas */
  --border:       #1F1A15;   /* hairline, ~4% opacidade percebida */
  --border-hover: #2E2620;

  /* Semânticos */
  --ok:           #5BB85B;
  --error:        #C0392B;
  --warn:         #D4A853;
}
```

### 5.2 Regra de uso do cobre

O cobre aparece em no máximo **três momentos por tela**. Tipicamente: logotipo, estado ativo, score. Nunca como preenchimento de área ampla, nunca em bordas grossas, nunca competindo com outra cor.

**Cores proibidas no produto:** roxo, azul, verde, laranja e amarelo como cores de interface. Verde e vermelho apenas em indicadores semânticos de acerto/erro, em baixa saturação.

### 5.3 Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
```

| Uso | Fonte | Peso | Observação |
|---|---|---|---|
| Títulos, números de score, rótulos de seção | Cinzel | 400–700 | `letter-spacing: 2–4px` em rótulos curtos |
| Corpo, cenários, alternativas | Cormorant Garamond | 300 | Peso 300 é obrigatório — é o que dá a leveza editorial |
| Ênfase em corpo | Cormorant Garamond | 400 | Nunca 600+ em texto corrido |

### 5.4 Princípios

- Estética de galeria, não de aplicativo SaaS.
- Bordas quase invisíveis. Hierarquia por espaço e tipografia, não por caixa.
- Animações de fade sutil. Nada de bounce, slide agressivo ou micro-interação chamativa.
- Nenhum emoji na interface do produto.
- Referências visuais: Celine, Aesop, Bottega Veneta.

---

## 6. Arquitetura alvo

### 6.1 Stack

```
Frontend       Next.js 14 (App Router) + React
Hospedagem     Vercel
Banco          Neon (PostgreSQL) + RLS
Auth           NextAuth.js + Prisma
IA             Claude API via route handler server-side
Orquestração   n8n (rotação mensal de questões)
```

### 6.2 Estrutura de diretórios

```
bizzia-sales-academy/
├─ app/
│  ├─ layout.tsx                 fonts Cinzel + Cormorant, metadata
│  ├─ globals.css                design system §5
│  ├─ page.tsx                   landing
│  ├─ academy/
│  │  ├─ page.tsx                entrada (dynamic, ssr: false)
│  │  └─ SalesAcademy.jsx        v5 unificado
│  └─ api/
│     ├─ simulate/route.ts       proxy seguro Claude API
│     └─ auth/[...nextauth]/route.ts
├─ lib/
│  ├─ questions-level1.js
│  ├─ questions-level2-expansion.js
│  ├─ questions-levels234.js
│  ├─ questions-final-expansion.js
│  └─ ai-evaluation-engine.js
├─ prisma/schema.prisma
├─ docs/
│  ├─ schema-neon.sql
│  ├─ n8n-workflow.json
│  └─ DOSSIE-MESTRE.md           este documento
├─ public/
├─ package.json
├─ next.config.js
└─ .env.example
```

### 6.3 Segurança da chave de API — obrigatório

A `ANTHROPIC_API_KEY` **nunca** pode ser exposta no cliente.

- Toda chamada à Claude API passa pelo route handler `app/api/simulate/route.ts`, server-side.
- O componente React chama `/api/simulate`, nunca `api.anthropic.com` diretamente.
- Se houver qualquer `fetch` para `api.anthropic.com` dentro de código de cliente no v5, **deve ser substituído** durante a migração.
- Rate limiting por usuário no route handler, para conter custo e abuso.

### 6.4 Variáveis de ambiente

```
ANTHROPIC_API_KEY=        # server-side apenas
DATABASE_URL=             # Neon connection string
NEXTAUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=             # https://bizzia-sales-academy.vercel.app
```

### 6.5 Certificado — arquitetura de credibilidade

Substitui a ideia descartada de blockchain.

- Número de série único por certificação emitida.
- Página pública `/verificar/[serial]` que confirma: nome, nível, data, pontuação, validade.
- Validade de 24 meses, com recertificação — cria recorrência natural de receita.
- Assinatura visual: BIZZ.IA + nome do responsável técnico do programa.

---

## 7. Plano de execução em Claude Code

### Fase 1 — Reconhecimento
Localizar os arquivos do v5 na máquina (ZIPs baixados, pasta de downloads) e o estado atual do repositório GitHub. Mapear o que existe antes de escrever qualquer coisa.

### Fase 2 — Scaffold
Criar a estrutura Next.js 14 conforme §6.2. Configurar `package.json`, `next.config.js`, fonts e `globals.css` com o design system de §5.

### Fase 3 — Migração do produto
Integrar v5 unificado. Substituir chamadas diretas à Claude API pelo route handler seguro. Validar que o build passa.

### Fase 4 — Correções de compliance
Aplicar todas as remoções e substituições de §4 no código, no conteúdo dos cenários e nos materiais de marketing presentes no repositório.

### Fase 5 — Deploy
Commit, push, e conexão do repositório correto ao projeto Vercel existente (`prj_1FZ7hWoV9ZPrmCvaiBynluxJJTtU`).

### Fase 6 — Validação
Executar o checklist de §9.

---

## 8. Comando de execução — colar no Claude Code

Abra o Claude Code na pasta onde estão os arquivos do projeto e cole o bloco abaixo integralmente.

```
Você vai retomar e publicar o BIZZ.IA Sales Academy. Leia este briefing
inteiro antes de agir.

## CONTEXTO
O projeto está parado há 4 meses. O produto está pronto (v5), mas nunca
foi publicado corretamente. O Vercel está conectado ao repositório errado
e serve conteúdo que não é a aplicação.

Projeto Vercel:  prj_1FZ7hWoV9ZPrmCvaiBynluxJJTtU
Team Vercel:     team_31fbLenXvEORvF1m9V7CFiqv
Repo correto:    MarcusCarvalho1322/bizzia-sales-academy
Domínio:         bizzia-sales-academy.vercel.app

O operador NÃO é desenvolvedor. Não peça para ele rodar comandos de git,
editar arquivos manualmente ou usar terminal. Execute você mesmo. Quando
precisar de algo que só ele pode fazer (login, chave de API, clique em
botão de interface), pare, explique em linguagem simples e aguarde.

## FASE 1 — RECONHECIMENTO (não escreva nada ainda)
1. Procure na máquina por: SalesAcademy_v5_unified.jsx,
   SalesAcademy_v4_Sprint4.jsx, SalesAcademy_v3_Sprint3.jsx,
   BIZZIA_SalesAcademy_Final.zip, BIZZIA_Sales_Academy_v3_Completo.zip,
   pasta sa-next, pasta sales-academy-deploy.
   Procure em Downloads, Documentos, Desktop e subpastas.
2. Verifique se existe um clone local de bizzia-sales-academy e o estado
   do repositório remoto.
3. Relate o que encontrou ANTES de prosseguir. Se os arquivos do v5 não
   existirem na máquina, pare e avise — eles precisam ser recuperados
   dos outputs das conversas anteriores no Claude.

## FASE 2 — SCAFFOLD
Crie a estrutura Next.js 14 App Router:

  app/layout.tsx, app/globals.css, app/page.tsx,
  app/academy/page.tsx, app/academy/SalesAcademy.jsx,
  app/api/simulate/route.ts, app/api/auth/[...nextauth]/route.ts,
  lib/ (arquivos de questões + ai-evaluation-engine),
  prisma/schema.prisma, docs/, public/,
  package.json, next.config.js, .env.example, .gitignore

DESIGN SYSTEM — aplicar sem desvio em globals.css:
  --black:#000000  --surface:#0A0A0A  --surface-2:#111111
  --copper:#B87333  --copper-light:#D4985A  --gold:#D4A853
  --text:#F0EDE8  --text-muted:#998E82  --text-dim:#5A5248
  --border:#1F1A15  --border-hover:#2E2620
  --ok:#5BB85B  --error:#C0392B  --warn:#D4A853

  Fontes: Cinzel (títulos, 400-700, letter-spacing 2-4px em rótulos)
          Cormorant Garamond (corpo, peso 300 obrigatório)
  Fundo sempre #000000. Cobre em no máximo 3 pontos por tela.
  PROIBIDO: roxo, azul, verde, laranja, amarelo como cor de interface.
  Verde/vermelho apenas como indicador semântico, baixa saturação.
  Sem emoji na interface. Bordas quase invisíveis. Fade sutil apenas.

## FASE 3 — MIGRAÇÃO
1. Integre o SalesAcademy_v5_unified.jsx em app/academy/SalesAcademy.jsx.
2. CRÍTICO — segurança: localize qualquer fetch direto para
   api.anthropic.com no código de cliente e substitua por chamada a
   /api/simulate. A ANTHROPIC_API_KEY só existe server-side, no route
   handler. Se encontrar a chave hardcoded em qualquer arquivo, remova
   e avise imediatamente.
3. Implemente rate limiting básico por usuário no route handler.
4. Rode o build. Corrija erros até passar limpo.

## FASE 4 — COMPLIANCE (obrigatório, não pule)
Faça uma varredura em TODO o repositório — código, conteúdo de cenários,
landing page, deck, textos de marketing — e:

REMOVER estas afirmações, sem exceção:
  - "+40% de conversão" / "40% em 90 dias"
  - "aumento médio de ticket em 35%"
  - "redução de 60% em objeções"
  - "LTV médio 3x maior"
  - "baseado em +1.000 atendimentos reais"
  - qualquer benchmark percentual de resultado sem fonte citada

SUBSTITUIR por: calculadora que usa os números do próprio cliente
  ("Sua clínica recebe X leads/mês e converte Y%. Cada ponto percentual
  recuperado vale R$ Z/ano.") em vez de promessa de resultado.

CORRIGIR o médico fictício:
  - Remover TODO número de CRM inventado (ex: "CRM 98765-SP")
  - Substituir nome por "Dr. [Cirurgião Responsável]"
  - Remover credenciais inventadas (Fellowship Harvard, "1.200
    rinoplastias") ou marcá-las como fictícias
  - Adicionar aviso visível nos cenários: "Cenário de treinamento.
    Profissional fictício."

CORRIGIR preços:
  - Marcar todos os valores de procedimento como "valor ilustrativo
    para fins de treinamento"
  - Preparar o painel de gestor para que a clínica configure a própria
    tabela de preços (criar o campo no schema; a UI pode vir depois)

ADICIONAR LGPD:
  - Página /privacidade e /termos (pode ser placeholder estruturado,
    conteúdo jurídico virá da advogada)
  - Aceite obrigatório no primeiro acesso, com timestamp no banco
  - Declarar subprocessadores: Anthropic, Neon, Vercel

Ao final, gere docs/RELATORIO-COMPLIANCE.md listando cada alteração
feita, com arquivo e linha.

## FASE 5 — DEPLOY
1. Commit com mensagem descritiva.
2. Push para MarcusCarvalho1322/bizzia-sales-academy, branch main.
3. Se o Vercel estiver conectado ao repositório errado, avise o operador
   com instrução visual simples (qual botão clicar na interface do
   Vercel) — não tente resolver por CLI.
4. Liste as variáveis de ambiente que ele precisa cadastrar, com
   instrução de onde clicar.

## FASE 6 — VALIDAÇÃO
Verifique e relate:
  - build passa sem erro
  - framework detectado como "nextjs" no Vercel
  - nenhuma chave de API no código de cliente
  - nenhuma afirmação de resultado sem fonte remanescente no repositório
  - nenhum CRM fictício remanescente
  - design system aplicado (fundo #000, Cinzel + Cormorant)

## REGRAS
- Não invente dados. Se faltar informação, pergunte.
- Não reescreva as 205 questões nem os 12 perfis de paciente — eles
  estão prontos e são o ativo mais valioso do projeto.
- Copie docs/DOSSIE-MESTRE.md para o repositório.
- Trabalhe em fases. Ao final de cada uma, relate em linguagem simples
  o que foi feito e o que vem a seguir.
```

---

## 9. Checklist de validação pós-deploy

| # | Verificação | Como validar |
|---|---|---|
| 1 | Build limpo | `next build` sem erro |
| 2 | Framework reconhecido | Vercel exibe `nextjs`, não `null` |
| 3 | Projeto live | `live: true` na API do Vercel |
| 4 | Chave protegida | Nenhuma ocorrência de `ANTHROPIC_API_KEY` fora de route handler |
| 5 | Simulação funcional | Uma conversa completa de 6 turnos com resposta e avaliação |
| 6 | Exame funcional | Um nível completo com gabarito e relatório |
| 7 | Design system | Fundo #000, Cinzel + Cormorant, cobre contido |
| 8 | Compliance | `RELATORIO-COMPLIANCE.md` gerado, zero afirmação sem fonte |
| 9 | LGPD | Páginas publicadas, aceite com timestamp |
| 10 | Banco | Schema Neon executado, RLS ativa |

**Definição de pronto:** os 10 itens verdes, mais parecer favorável da Dra. Emmanuelle. Sem os dois, não há apresentação a cliente.

---

## 10. Dependências externas

| Dependência | Responsável | Bloqueia |
|---|---|---|
| Parecer jurídico CFM + LGPD | Dra. Emmanuelle | Apresentação comercial |
| Chave `ANTHROPIC_API_KEY` no Vercel | Marcus | Módulo de simulação |
| Provisionar banco Neon + executar schema | Marcus (ou Claude Code com credencial) | Auth, multi-tenancy |
| Reconectar repositório correto no Vercel | Marcus (clique na interface) | Deploy |
| Tabelas de preço reais das clínicas | Marcus | Correção §4.4 definitiva |
| Deploy do n8n no Railway | Marcus | Rotação mensal de questões |

---

## 11. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Arquivos do v5 não estarem na máquina | Média | Alto | Fase 1 detecta antes de qualquer trabalho; recuperar dos outputs das conversas anteriores |
| Parecer jurídico exigir reescrita de cenários | Média | Médio | Enviar briefing (Anexo A) em paralelo à Fase 2, não depois |
| Custo de Claude API escalar sem controle | Baixa | Médio | Rate limiting no route handler + cota por plano |
| Novo abandono após esta sessão | **Alta** | **Alto** | Este dossiê no repositório; qualquer sessão futura retoma sem reconstituir histórico |

O último risco é o mais relevante. O projeto já foi abandonado duas vezes no mesmo ponto. A mitigação é este documento viver dentro do repositório.

---

# ANEXO A — Briefing para a Dra. Emmanuelle Moura da Silva

**De:** Marcus Cardoso Carvalho — BIZZ.IA
**Assunto:** Validação jurídica — plataforma de capacitação em atendimento para clínicas de cirurgia plástica e estética

## A.1 O que é o produto

Plataforma SaaS de capacitação profissional destinada a **equipes de recepção e atendimento de clínicas** de cirurgia plástica e medicina estética. Não é dirigida a pacientes nem ao público geral. Composta por:

- **Módulo de exames:** 205 questões de múltipla escolha sobre atendimento consultivo, distribuídas em 4 níveis, com certificação.
- **Módulo de simulação:** conversas com pacientes virtuais gerados por inteligência artificial, com avaliação automática do desempenho da atendente.

Modelo de contratação: B2B, licença por clínica, com painel de gestão para a proprietária.

## A.2 Pontos que precisam de validação

**1. Enquadramento sob a Resolução CFM 2.336/2023 e o Código de Ética Médica**
A plataforma treina profissionais **não médicos** para conduzir o primeiro atendimento de pacientes interessados em procedimentos. Não há promessa de resultado nem exibição de antes/depois no produto. Ainda assim: há restrição aplicável? A responsabilidade recai sobre a clínica contratante, sobre o médico responsável técnico, ou também sobre o fornecedor da capacitação?

**2. Limite entre atendimento consultivo e captação indevida de pacientes**
O treinamento ensina técnicas de descoberta de necessidade, tratamento de objeção e condução ao agendamento. Onde está a fronteira entre qualificação legítima de atendimento e mercantilização vedada da medicina?

**3. Técnicas específicas — quais são defensáveis**
Alguns conteúdos precisam de avaliação individual:
- Criação de senso de urgência ("há quanto tempo você convive com isso?")
- Ancoragem de investimento em retorno profissional
- Quantificação do custo de não realizar o procedimento
- Tratamento de objeção de preço

Alguma dessas técnicas é inadequada no contexto de decisão sobre procedimento cirúrgico? Recomenda supressão ou reformulação de alguma?

**4. Responsabilidade sobre a conduta da atendente treinada**
Se uma recepcionista treinada pela plataforma prestar informação inadequada a um paciente, existe cadeia de responsabilidade que alcance a BIZZ.IA? Que cláusulas contratuais mitigam?

**5. Limite de conteúdo técnico-médico**
O material descreve procedimentos, tempos de recuperação e riscos, para que a atendente compreenda o que está sendo tratado. Há limite para o que pessoa não médica pode informar a paciente? Precisamos de aviso explícito de que informação clínica é atribuição exclusiva do médico?

**6. LGPD**
Ver §4.5 do dossiê. Pontos principais: base legal para dados de alunos; retenção de transcrições de simulação (dados de desempenho profissional); declaração de subprocessadores (Anthropic, Neon, Vercel); e confirmação de que nenhum dado de paciente real trafega pelo sistema.

**7. Uso de identidade profissional em cenário de treinamento**
Os cenários mencionavam um cirurgião fictício com número de CRM inventado — já em processo de remoção. Confirmar: para usar nome e credenciais de cirurgião real nos materiais, que instrumento de autorização é necessário?

## A.3 O que se pede

Parecer objetivo indicando: **(a)** o que pode permanecer como está, **(b)** o que precisa de reformulação, com sugestão de redação, **(c)** o que deve ser suprimido, **(d)** quais avisos e cláusulas contratuais são obrigatórios, e **(e)** minutas de política de privacidade e termos de uso.

**Prazo desejado:** anterior à primeira apresentação comercial. O desenvolvimento técnico segue em paralelo e será ajustado conforme o parecer.

---

*BIZZ.IA Intelligence Ecosystem — Documento de trabalho interno. Contém decisões técnicas e jurídicas pendentes de validação. Não distribuir a clientes.*
