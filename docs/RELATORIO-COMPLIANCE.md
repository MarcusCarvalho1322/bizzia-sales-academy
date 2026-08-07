# Relatório de Compliance — BIZZ.IA Sales Academy

**Emitido em:** 05 de agosto de 2026
**Escopo:** varredura completa do repositório `MarcusCarvalho1322/bizzia-sales-academy`
**Referência normativa:** `docs/DOSSIE-MESTRE.md` §4 (Correções obrigatórias de compliance — P0)
**Validação jurídica pendente:** Dra. Emmanuelle Moura da Silva — OAB/SP 528.742

> Este documento registra o que foi alterado, com arquivo e linha. Ele não
> substitui o parecer jurídico. As pendências que dependem da advogada estão
> listadas na seção 7.

---

## 1. Resumo

| Item do §4 | Estado |
|---|---|
| 4.1 — Remoção de dados fabricados | Concluído |
| 4.2 — Calculadora com números do cliente | Concluído |
| 4.3 — Médico fictício e CRM inventado | Concluído |
| 4.4 — Preços de procedimento | Concluído (UI); tabela da clínica no schema, UI futura |
| 4.5 — LGPD | Estrutura concluída; conteúdo jurídico e persistência em banco pendentes |
| §6.3 — Chave de API protegida | Concluído |

---

## 2. §4.1 — Afirmações de resultado sem fonte

### 2.1 Varredura das cinco afirmações listadas no dossiê

Busca literal em todo o repositório (`app/`, `lib/`, `prisma/`, `docs/`,
`public/`, arquivos de raiz), incluindo variações de grafia:

| Afirmação procurada | Ocorrências encontradas |
|---|---|
| "+40% de conversão" / "40% em 90 dias" | **0** |
| "aumento médio de ticket em 35%" | **0** |
| "redução de 60% em objeções" | **0** |
| "LTV médio 3x maior" | **0** |
| "baseado em +1.000 atendimentos reais" | **0** |

**Conclusão:** nenhuma das cinco afirmações existia no código-fonte da
aplicação. Elas circulavam no deck de vendas, na landing page HTML e no
material comercial produzidos em sessões anteriores — **materiais que nunca
foram versionados neste repositório**. Ver seção 7.1: eles continuam
existindo fora do repositório e precisam ser corrigidos separadamente.

### 2.2 Benchmarks percentuais sem fonte encontrados e removidos

Estes **não** estavam na lista do dossiê, mas se enquadram na regra
"qualquer benchmark percentual de resultado sem fonte citada".

**`lib/material.js` — Material complementar do Nível 4 (LTV Master)**

| Linha (antes) | Texto removido | Substituição |
|---|---|---|
| 97 | `• Paciente média: 2-3 procedimentos em 5 anos = R$15-25k` | Texto qualitativo + instrução para a clínica levantar o próprio LTV. Ver `lib/material.js:96` |
| 98 | `• Paciente VIP bem gerida: 8-12 procedimentos + 3-5 indicações = R$80-150k` | idem |
| 99 | `• A diferença está 100% na qualidade do relacionamento` | Removido — atribuição causal de 100% não é sustentável |
| 119 | `• Taxa de retorno em 12 meses > 60%` | `• Taxa de retorno em 12 meses` (indicador a medir, sem meta inventada). Ver `lib/material.js:123` |
| 120 | `• Taxa de indicação orgânica > 40% das novas leads` | `• Proporção de novas pacientes que chegam por indicação` |
| 121 | `• NPS > 70` | `• NPS (Net Promoter Score)` |

O bloco reescrito instrui explicitamente: *"qualquer benchmark que você
encontrar sem fonte citada provavelmente foi inventado"* — a regra do dossiê
virou conteúdo didático.

### 2.3 Percentuais revisados e mantidos, com justificativa

Três ocorrências percentuais permanecem no banco de questões. **Não são
afirmações de resultado do produto** — são elementos de cenário de
treinamento, e o dossiê determina não reescrever as 205 questões.

| Arquivo:linha | Texto | Por que permanece |
|---|---|---|
| `lib/questions.js:190` | "Paciente compara sua clínica com hospital universitário 40% mais barato" | Situação hipotética que a atendente enfrenta. Não afirma resultado da plataforma. |
| `lib/questions.js:242` e `:316` | "Paciente menciona ir à Colômbia por 60% menos" | idem |
| `lib/questions.js:358` | "Mais de 50% das novas pacientes chegam por indicação" | Alternativa de múltipla escolha que descreve *qualitativamente* como se reconhece LTV maduro. Não é promessa nem benchmark de mercado. |

**Recomendação para a advogada:** confirmar se a leitura acima procede ou se
prefere reformulação também nesses quatro pontos.

---

## 3. §4.2 — Calculadora no lugar da promessa

Criados dois arquivos:

- **`app/page.tsx`** — landing page sem nenhuma afirmação de resultado. O
  bloco de metodologia (linha ~178) usa a redação aprovada no dossiê §4.2:
  *"Construído sobre a metodologia RAP — Recepção de Alta Performance"*,
  sem número de atendimentos.
- **`app/Calculadora.tsx`** — calculadora que só faz aritmética sobre os
  números que a clínica informa: leads/mês, taxa de conversão atual e ticket
  médio. Responde uma única pergunta verificável: **quanto vale um ponto
  percentual de conversão nesta clínica, por ano.**

A calculadora **não** estima ganho, **não** projeta melhoria e **não** usa
benchmark de mercado. O texto abaixo do resultado declara isso explicitamente
(`app/Calculadora.tsx:131`):

> *"Aritmética simples sobre os números que você informou. Não é projeção de
> ganho nem promessa de resultado — é a medida do que está em disputa no
> primeiro contato."*

Há um comentário no topo do arquivo alertando que acrescentar "ganho
esperado" ou "resultado médio" reintroduz a afirmação sem lastro.

---

## 4. §4.3 — Médico fictício e CRM inventado

### 4.1 Varredura

| Termo procurado | Ocorrências |
|---|---|
| `CRM 98765-SP` / qualquer `CRM` + número | **0** |
| "Dr. Eduardo Cardoso" | **0** |
| "Fellowship" | **0** |
| "Harvard" | **0** |
| "1.200 rinoplastias" | **0** |

**Conclusão:** o personagem com CRM inventado **não existe** no v5. Ele
circulava em materiais de sessões anteriores que não estão neste repositório
(ver 7.1). As quatro ocorrências da sigla "CRM" em `lib/questions.js` referem-se
a *Customer Relationship Management* (software de gestão de relacionamento),
não a registro no Conselho Regional de Medicina.

### 4.2 Prevenção — três camadas

Mesmo sem ocorrência atual, foram adicionadas salvaguardas para que o problema
não reapareça:

1. **Aviso visível nos cenários.** Constante `AVISO_CENARIO` =
   *"Cenário de treinamento. Profissional fictício."*
   (`app/academy/SalesAcademy.jsx:25`), exibida em três pontos:
   - barra de contexto da simulação — `SalesAcademy.jsx:834`
   - tela de abertura do exame — `SalesAcademy.jsx:652`
   - rodapé do painel do aluno — `SalesAcademy.jsx:624`

2. **Instrução à IA.** O system prompt do simulador ganhou duas regras
   (`app/academy/SalesAcademy.jsx:98-99`):
   > *"4. Esta persona é FICTÍCIA e existe apenas para treinamento. Nunca cite
   > um médico real, nunca invente número de CRM, registro profissional ou
   > credencial verificável. Refira-se ao cirurgião apenas como 'a Dra.' ou
   > 'o Dr. [Cirurgião Responsável]'."*
   >
   > *"5. Se mencionar valores, trate-os como ilustrativos. Não afirme
   > resultado clínico garantido nem estatística de desempenho sem fonte."*

   Isso fecha a porta pela qual o problema entraria de novo: a IA gerando
   credencial plausível no meio de uma conversa.

3. **Rodapé da landing page** (`app/page.tsx:219`): *"Todos os cenários e
   personas de treinamento são fictícios."*

### 4.3 Referências genéricas mantidas

`lib/questions.js:412` usa `Dra. [nome]` como marcador de template — já é o
padrão correto (sem nome inventado, sem registro). Mantido.

---

## 5. §4.4 — Preços de procedimento

### 5.1 Rótulo de valor ilustrativo

Constante `AVISO_VALOR` = *"Valor ilustrativo para fins de treinamento."*
(`app/academy/SalesAcademy.jsx:26`), exibida em:

| Local | Arquivo:linha |
|---|---|
| Abaixo da faixa de valor de cada um dos 4 níveis, no painel | `SalesAcademy.jsx:496` |
| Tela de abertura de cada exame | `SalesAcademy.jsx:653` |

Comentário adicionado em `lib/courses.js:18` registrando que as faixas
(`R$ 3–8k`, `R$10–25k`, `R$25–80k`, `R$100k+`) são referência de
posicionamento, não tabela de preços.

Nos Termos de Uso (`app/termos/page.tsx`, seção 2) a mesma afirmação aparece
em linguagem contratual:

> *"Os valores de procedimento exibidos são ilustrativos e não constituem
> tabela de preços, referência de mercado ou sugestão de precificação. A
> clínica contratante configura a própria tabela."*

### 5.2 Tabela de preços configurável pela clínica

Campo criado no schema, conforme o dossiê pediu ("criar o campo no schema;
a UI pode vir depois"):

```prisma
model Clinic {
  priceTable      Json?      // prisma/schema.prisma:53
  priceTableSetAt DateTime?  // prisma/schema.prisma:54
}
```

Formato documentado no próprio schema. Enquanto `priceTable` for nula, a
interface exibe apenas faixas rotuladas como ilustrativas — o comportamento
atual. **A UI de configuração no painel de gestor ainda não existe** e está
listada como pendência (7.2).

---

## 6. §4.5 — LGPD

### 6.1 Páginas publicadas

| Rota | Arquivo | Estado |
|---|---|---|
| `/privacidade` | `app/privacidade/page.tsx` | Estrutura com 8 seções |
| `/termos` | `app/termos/page.tsx` | Estrutura com 8 seções |

Ambas usam o componente `app/LegalPage.tsx`, que oferece o marcador
`<Pendente>` — um bloco **visualmente destacado** com a tarja *"Aguardando
parecer jurídico"*. A escolha é deliberada: um placeholder invisível vira,
com o tempo, uma política publicada pela metade.

**O que já está escrito** (afirmação factual sobre o sistema, não decisão
jurídica): quais dados são tratados, quem tem acesso, subprocessadores,
segurança da chave de API, e a declaração de que nenhum dado de paciente real
trafega pelo sistema.

**O que está marcado como pendente** (9 blocos): razão social e DPO, base
legal por finalidade, localização de armazenamento e transferência
internacional, prazo de retenção definitivo, canal de exercício de direitos,
medidas do art. 46, limite CFM entre atendimento consultivo e captação, cadeia
de responsabilidade, e vigência/foro.

### 6.2 Aceite obrigatório no primeiro acesso

Implementado em `app/academy/SalesAcademy.jsx:340-399`. O usuário não alcança
a tela de login sem aceitar (`SalesAcademy.jsx:212`):

```js
setView(data.session ? "dashboard" : consentGiven() ? "login" : "consent");
```

O registro gravado inclui o timestamp exigido (`SalesAcademy.jsx:42`):

```js
{ version: "2026-08-05", acceptedAt: "2026-08-05T10:49:51.511Z" }
```

A versão dos termos é constante versionada (`VERSAO_TERMOS`,
`SalesAcademy.jsx:27`). Ao mudar a versão, o aceite é solicitado de novo.

**LIMITAÇÃO ATUAL — ver 7.3.** O timestamp é gravado no navegador, não no
banco. O banco Neon ainda não foi provisionado. O modelo já existe no schema:

```prisma
model TermsAcceptance {          // prisma/schema.prisma:99
  document   DocumentKind
  version    String
  acceptedAt DateTime @default(now())   // linha 108
  ipAddress  String?
  userAgent  String?
  @@unique([userId, document, version])
}
```

Assim que `DATABASE_URL` estiver configurada, o aceite passa a gravar ali.

### 6.3 Subprocessadores declarados

`app/privacidade/page.tsx`, seção 5 — os três exigidos pelo dossiê, cada um
com a descrição do que efetivamente recebe:

- **Anthropic** — texto escrito pela aluna durante o treinamento e descrição
  da persona fictícia.
- **Neon** — usuários, resultados e transcrições.
- **Vercel** — hospedagem e logs de acesso.

Também aparecem na tela de aceite (`SalesAcademy.jsx:358`).

### 6.4 Retenção de transcrições

Campo `Clinic.transcriptRetentionMonths` com padrão 12
(`prisma/schema.prisma:58`) e `SimulationResult.purgeAfter` indexado
(`prisma/schema.prisma:161`), prontos para a rotina de expurgo. O prazo
definitivo depende do parecer.

---

## 7. Pendências

### 7.1 Materiais comerciais fora do repositório — **bloqueador P0**

As cinco afirmações fabricadas do §4.1 **não estavam no código**, mas o dossiê
registra que elas circulam em:

- deck de vendas PPTX (11 slides)
- landing page HTML premium
- modelo comercial com calculadora de ROI

Esses arquivos não estão neste repositório e **não foram corrigidos por esta
varredura**. Enquanto existirem com o texto atual, o risco sob o art. 37 do
CDC permanece. Ação: localizar cada um e aplicar as substituições do §4.2, ou
retirá-los de circulação.

### 7.2 UI da tabela de preços

O campo existe no schema. A tela no painel de gestor para a clínica preencher
a própria tabela ainda não foi construída. Sem ela, o rótulo "valor
ilustrativo" é a única proteção — e é suficiente por ora.

### 7.3 Persistência do aceite em banco

Depende de provisionar o Neon e cadastrar `DATABASE_URL`. Até lá, o aceite
existe apenas no navegador de quem aceitou: se a pessoa limpar os dados do
site, o aceite é solicitado de novo e o registro anterior se perde. Para uso
em demonstração é aceitável; **para contratação comercial, não é.**

### 7.4 Parecer jurídico

Os 9 blocos `<Pendente>` das páginas legais e as sete perguntas do Anexo A do
dossiê continuam abertos.

---

## 8. §6.3 — Segurança da chave de API

Verificação executada em todo o repositório:

| Verificação | Resultado |
|---|---|
| `sk-ant-` em código de aplicação | **0 ocorrências** |
| `ANTHROPIC_API_KEY` fora do route handler | **0 ocorrências** |
| `fetch` para `api.anthropic.com` em código de cliente | **0 ocorrências** |

A única leitura de `process.env.ANTHROPIC_API_KEY` está em
`app/api/simulate/route.ts:107`, e a única chamada a `api.anthropic.com` está
na linha 138 do mesmo arquivo — ambas server-side.

O cliente chama exclusivamente `/api/simulate`
(`app/academy/SalesAcademy.jsx:73`).

### 8.1 Rate limiting

Implementado em `app/api/simulate/route.ts:47`. Janela de 60 segundos,
limite configurável por `RATE_LIMIT_PER_MINUTE` (padrão: 10 chamadas por
usuário por minuto). A identificação usa o cabeçalho `x-academy-user` enviado
pelo cliente autenticado, com o IP como alternativa
(`route.ts:40`). Responde `429` com `Retry-After`.

**Limitação conhecida:** o contador vive na memória da instância serverless,
então o limite vale por instância. Quando o Neon estiver ativo, migrar o
contador para o banco ou para Vercel KV. Registrado em comentário no próprio
arquivo.

### 8.2 Endurecimento adicional

- Validação de entrada: papel da mensagem, tamanho por mensagem (4.000
  caracteres) e número de mensagens por sessão (40) — `route.ts:79-105`.
- Erros da API upstream não são repassados brutos ao cliente; são registrados
  no log do servidor e traduzidos em mensagem genérica — `route.ts:152-155`.
- `docs/nextauth-config.js` recebeu banner declarando que é documento de
  referência da v3 e que todos os valores de credencial ali são placeholders.

---

## 9. Design system (§5) — verificação

Medido no navegador, com a aplicação rodando:

| Requisito | Verificado |
|---|---|
| Fundo `#000000` | `rgb(0, 0, 0)` |
| Títulos em Cinzel | `Cinzel, Georgia, serif` |
| Corpo em Cormorant Garamond peso 300 | `"Cormorant Garamond", Georgia, serif` / `font-weight: 300` |
| Texto primário `#F0EDE8` | `rgb(240, 237, 232)` |
| Tokens da paleta | 13 de 13 presentes em `app/globals.css` |
| Cores proibidas (roxo, azul, laranja) | 0 ocorrências |
| Verde/vermelho apenas semânticos | Confirmado: só acerto/erro e score |

### 9.1 Emoji removidos da interface

O dossiê §5.4 determina "nenhum emoji na interface". Removidos:

| Local | Antes | Depois |
|---|---|---|
| Abas do painel | `📋 EXAMES` / `🎭 SIMULAÇÃO IA 🔒` | `EXAMES` / `SIMULAÇÃO IA · PRO` |
| Card de curso bloqueado | `🔒` | Removido (o botão já diz BLOQUEADO) |
| Muro de upgrade | `🎭` | Removido |
| Aviso do exame | `⚠️` | Removido |
| Gabarito e transcrição | `💡`, `📋` | Removidos |
| Certificados | `🏆`, `🎭` | Removidos |
| Avatares das 12 pacientes | `👩`, `👨‍💼`, `👩‍🦳`… | Iniciais em Cinzel dentro de círculo |
| Material complementar | `📚` (4x) | Removidos |

O campo `emoji` foi eliminado dos 12 perfis em `lib/patient-profiles.js`.

Mantidos: `✓`, `✗`, `↗`, `✦` — são sinais tipográficos, não emoji, e
renderizam na fonte serifada.

---

## 10. Integridade do conteúdo

Verificado após toda a migração:

| Ativo | Esperado | Encontrado |
|---|---|---|
| Questões | 205 | **205** |
| Perfis de paciente | 12 | **12** |
| Níveis de certificação | 4 | **4** |
| Competências | 12 | **12** |

Nenhuma questão foi reescrita. Nenhum perfil foi alterado, salvo a remoção do
campo `emoji`. As alterações de conteúdo se restringem ao material
complementar do Nível 4, listadas em 2.2.

---

## 11. Validade do exame — correção de 07/08/2026

### 11.1 O defeito

O operador relatou ter acertado 97% de um exame **sem ler os enunciados**,
apenas marcando sempre a alternativa mais longa. A medição confirmou e
agravou o relato:

| Medição | Antes |
|---|---|
| "Marcar sempre a mais longa" acerta | **204 de 205 = 99,5%** |
| Comprimento médio da alternativa correta | 202 caracteres |
| Comprimento médio das alternativas erradas | 48 caracteres |
| Razão | **4,26x** |

Por nível: 100%, 100%, 100%, 98%. O exame não media competência — media
quem percebeu o padrão. Qualquer certificação emitida com esse banco era
tecnicamente inválida.

Causa: as respostas corretas eram falas desenvolvidas da recepcionista;
as erradas eram descartes de uma linha.

### 11.2 O que foi alterado

**615 distratores reescritos** — as três alternativas incorretas de cada
uma das 205 questões. Cada uma passou a ser uma conduta plausível na
superfície, desenvolvida no mesmo registro e comprimento da correta, e
errada exatamente pelo motivo que o campo de feedback aponta.

**Não foi tocado:** nenhum enunciado, nenhuma resposta correta, nenhum
gabarito (exceto 11.4), nenhuma competência, nenhum feedback. A
verificação de integridade roda a cada aplicação e aborta se algum desses
campos mudar.

Três passes de balanceamento:
1. Reescrita dos 615 distratores.
2. 85 distratores estendidos onde a correta ainda era a mais longa.
3. 141 distratores convertidos em fala direta — ver 11.3.

### 11.3 Segunda pista, encontrada pelo verificador

Ao construir o verificador automático, apareceu um sinal que a inspeção
manual não tinha visto: em 140 das 205 questões, **a alternativa correta
era a única escrita entre aspas** (fala direta da recepcionista). Sozinho,
esse sinal acertava **68,3%** — praticamente a nota de corte de 70%.

Corrigido prefixando um distrator de cada questão afetada com a fala que
aquela conduta errada produziria na prática.

### 11.4 Erro de gabarito — questão 4.49

Encontrado durante a revisão. **O gabarito apontava para uma conduta de
sonegação fiscal.**

- Pergunta: *"Qual é a abordagem correta quando paciente VIP solicita que
  a clínica não emita nota fiscal por 'motivos pessoais'?"*
- Marcada como correta (`c: 2`): *"Aceitar apenas para procedimentos
  abaixo de determinado valor."*
- O próprio feedback da questão diz: *"Omissão de nota fiscal é sonegação
  — independentemente do valor do relacionamento."*

O gabarito contradizia o feedback e orientava conduta ilícita. Corrigido
para `c: 3` — a alternativa que explica a obrigatoriedade legal da
emissão. Esta é a **única** alteração de gabarito em todo o banco.

### 11.5 Resultado medido

| Heurística de superfície | Antes | Depois | Acaso |
|---|---|---|---|
| Sempre a mais longa | **99,5%** | 14,1% | 25% |
| Sempre a mais curta | 0,0% | 33,7% | 25% |
| A única entre aspas | 68,3% | 13,2% | 25% |
| A que tem mais vírgulas | — | 41,5% | 25% |
| Sempre a primeira | — | 26,3% | 25% |
| Sempre a última | — | 24,4% | 25% |
| Razão de comprimento correta/erradas | 4,26x | **0,95x** | 1,00x |

A melhor heurística disponível hoje entrega 41,5%. A menor nota de corte
do produto é 70%. **Não há mais como passar sem ler.**

### 11.6 Trava permanente

Criado `scripts/verificar-questoes.mjs`, ligado ao `prebuild` no
`package.json`. O build **falha** se qualquer heurística ultrapassar 45%,
se a razão de comprimento sair da faixa 0,80x–1,25x, se o banco deixar de
ter 205 questões, ou se houver alternativa duplicada, vazia ou curta
demais.

Rodar manualmente:

```
npm run verificar-questoes
```

O defeito não pode voltar sem quebrar o build.

### 11.7 Pendência

Os distratores foram escritos nesta sessão e **não passaram por revisão de
especialista em atendimento de clínica**. Eles são plausíveis e
tecnicamente errados pelo motivo certo, mas a calibragem fina de quão
tentador cada um deve ser merece uma leitura de quem treina recepção na
prática. Recomenda-se revisão amostral antes da primeira turma paga.


---

*Documento gerado durante a migração de 05/08/2026. Qualquer alteração
posterior em conteúdo comercial ou de cenário deve atualizar este relatório.*