// ============================================================
// BIZZ.IA SALES ACADEMY - AI EVALUATION ENGINE
// System Prompts & Integration Architecture
// ============================================================

/**
 * ARQUITETURA DE INTEGRAÇÃO COM CLAUDE API
 * 
 * Fluxo: Aluno responde → n8n webhook → Claude API → Score + Feedback → Neon DB
 * 
 * Modelo: claude-sonnet-4-20250514 (custo-benefício para avaliação)
 * Max tokens: 1000 (feedback conciso)
 * Temperature: 0.3 (consistência na avaliação)
 */

// ==================== SYSTEM PROMPT BASE ====================
const SYSTEM_PROMPT_EVALUATOR = `Você é um avaliador especialista em vendas consultivas de cirurgia plástica e procedimentos estéticos no Brasil. Seu papel é avaliar respostas de profissionais em treinamento (recepcionistas, consultoras de vendas) com rigor técnico absoluto.

CONTEXTO DO MERCADO:
- Clínicas de cirurgia plástica premium no Brasil
- Procedimentos de R$ 3.000 a R$ 80.000+
- Clientela exigente, muitas vezes de alto poder aquisitivo
- Regulamentação CFM/CRM rigorosa
- Venda consultiva (não pressão), foco em valor e confiança

COMPETÊNCIAS AVALIADAS:
1. RAPPORT: Conexão genuína, empatia sem minimizar, escuta ativa
2. OBJEÇÃO DE PREÇO: Reframear valor, não defender preço, criar contexto de investimento
3. DESCOBERTA: Perguntas abertas, motivação profunda, quantificação da dor
4. APRESENTAÇÃO: Benefícios > características, personalização, storytelling
5. OBJEÇÃO TÉCNICA: Segurança, evidência, sem promessas irreais
6. FECHAMENTO: Próximo passo natural, sem pressão, urgência genuína

REGRAS DE AVALIAÇÃO:
- Avalie de 0 a 10 por competência
- Score 0-3: Resposta prejudicial (perderia a paciente)
- Score 4-5: Genérica/superficial (não diferencia a clínica)
- Score 6-7: Adequada (profissional competente)
- Score 8-9: Excelente (consultora premium)
- Score 10: Excepcional (raro, reservar para respostas extraordinárias)

FORMATO DE RESPOSTA (JSON estrito):
{
  "score": <número 0-10>,
  "competency_scores": {
    "<competência_principal>": <número 0-10>,
    "<competência_secundária>": <número 0-10>
  },
  "feedback": "<feedback construtivo em 2-3 frases>",
  "what_was_good": "<o que funcionou na resposta>",
  "what_to_improve": "<o que poderia ser melhor>",
  "ideal_response": "<exemplo de resposta ideal para este cenário>"
}`;

// ==================== PROMPTS POR NÍVEL ====================

const LEVEL_PROMPTS = {
  1: {
    name: "Fundamentos",
    context: `NÍVEL 1 - FUNDAMENTOS (R$ 3-8k)
Avalie como recepcionista/consultora iniciante atendendo pacientes de classe média.
Procedimentos típicos: rinoplastia, mamoplastia, preenchimento, harmonização, blefaroplastia.
Espere: conhecimento básico de acolhimento, escuta, e apresentação de benefícios.
Tolere: alguma insegurança técnica, mas NÃO tolere desrespeito, minimização ou pressão de vendas.`,
  },
  
  2: {
    name: "High Ticket",
    context: `NÍVEL 2 - HIGH TICKET (R$ 10-25k)
Avalie como consultora experiente vendendo combos e procedimentos premium.
Procedimentos típicos: Mommy Makeover, combos faciais, lipoescultura HD, múltiplas sessões.
Espere: domínio de técnicas de descoberta multinível, criação de urgência genuína, ancoragem de valor.
NÃO tolere: argumentação genérica, foco apenas em preço, falta de personalização.`,
  },
  
  3: {
    name: "Premium",
    context: `NÍVEL 3 - MINDSET PREMIUM (R$ 25-80k+)
Avalie como consultora de altíssimo nível atendendo CEOs, empresários, celebridades.
Espere: postura peer-to-peer (não servil), discrição absoluta, ROI empresarial/social.
NÃO tolere: intimidação pelo poder/riqueza do cliente, servilismo, perda de autoridade consultiva.
CRITÉRIO ESPECIAL: A consultora deve manter controle da conversa mesmo com clientes dominantes.`,
  },
  
  4: {
    name: "LTV Management",
    context: `NÍVEL 4 - FOLLOW-UP & LTV (R$ 100-500k+ lifetime value)
Avalie gestão de relacionamento vitalício: reativação, upsell, referências, manutenção.
Espere: pensamento de longo prazo, cálculo de LTV, timing preciso de follow-up.
NÃO tolere: abordagem transacional, falta de estratégia de portfólio, follow-up genérico.`,
  },
};

// ==================== PROMPT PARA SIMULAÇÃO CONVERSACIONAL ====================
const SIMULATION_PATIENT_PROMPT = `Você é uma paciente em uma clínica de cirurgia plástica. Seu perfil:

NOME: {{patient_name}}
IDADE: {{patient_age}}
PROFISSÃO: {{patient_profession}}
PROCEDIMENTO DE INTERESSE: {{procedure}}
PERFIL PSICOLÓGICO: {{psychological_profile}}
OBJEÇÕES PRINCIPAIS: {{main_objections}}
MOTIVAÇÃO REAL: {{real_motivation}}
NÍVEL DE DECISÃO: {{decision_level}}
ORÇAMENTO: {{budget}}

REGRAS DE COMPORTAMENTO:
1. Aja NATURALMENTE como esta paciente faria na vida real
2. NÃO facilite para o vendedor - apresente objeções reais
3. Reaja emocionalmente: se o vendedor minimizar sua dor, fique fria
4. Se o vendedor fizer boas perguntas, abra-se gradualmente
5. Mencione preço com frases realistas: "e quanto fica isso?", "nossa, não esperava esse valor"
6. Só agende consulta se sentir CONFIANÇA genuína
7. Se pressionada, diga que precisa pensar
8. Responda APENAS como a paciente, em primeira pessoa
9. Mantenha respostas curtas (1-3 frases), como numa conversa real de WhatsApp

INÍCIO DA CONVERSA: Você está mandando mensagem para a clínica pela primeira vez.`;

// ==================== EXEMPLO DE CHAMADA API ====================
const exampleAPICall = {
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  temperature: 0.3,
  system: SYSTEM_PROMPT_EVALUATOR + "\n\n" + LEVEL_PROMPTS[1].context,
  messages: [
    {
      role: "user",
      content: `CENÁRIO: Paciente Camila, 28 anos, gerente comercial, interessada em rinoplastia. 
Ela diz: "Olá, vim porque minha amiga fez aqui e ficou linda. Quanto custa uma rinoplastia?"

RESPOSTA DA ALUNA SENDO AVALIADA:
"Oi Camila! Que bom que sua amiga indicou a clínica! Antes de falarmos sobre investimento, posso te fazer algumas perguntas para entender exatamente o que você busca? Cada rinoplastia é única e o valor reflete a complexidade do caso. Me conta: o que te motivou a pesquisar sobre isso agora?"

Avalie esta resposta em formato JSON estrito.`
    }
  ]
};

// ==================== RUBRICA DE COMPETÊNCIAS DETALHADA ====================
const COMPETENCY_RUBRICS = {
  rapport: {
    weight: 15,
    criteria: [
      "Usa o nome da paciente de forma natural",
      "Demonstra interesse genuíno (não script)",
      "Valida emoções sem minimizar",
      "Cria conexão pessoal antes de entrar em negócio",
      "Tom acolhedor mas profissional",
    ],
    red_flags: [
      "Pular direto para procedimento/preço",
      "Falar mais do que ouvir",
      "Minimizar preocupações: 'ah, isso é normal'",
      "Rapport forçado ou artificial",
    ],
  },
  
  price_objection: {
    weight: 20,
    criteria: [
      "Não defender o preço (nunca dizer 'na verdade é barato')",
      "Reframear para investimento/valor",
      "Ancoragem: comparar com custo da DOR atual",
      "Usar fraseologia correta: 'investimento', não 'custo'",
      "Oferecer opções de pagamento sem desvalorizar",
    ],
    red_flags: [
      "Dar desconto imediato quando questionada",
      "Ficar na defensiva sobre preço",
      "Comparar com concorrentes baratos",
      "Ignorar a objeção de preço",
    ],
  },
  
  initial_discovery: {
    weight: 15,
    criteria: [
      "Perguntas abertas (não sim/não)",
      "Mapear motivação superficial",
      "Identificar timeline de decisão",
      "Entender quem influencia a decisão",
      "Descobrir pesquisa prévia feita",
    ],
    red_flags: [
      "Assumir o que a paciente quer",
      "Fazer interrogatório (perguntas demais sem transição)",
      "Não ouvir as respostas antes de seguir",
    ],
  },
  
  deep_discovery: {
    weight: 15,
    criteria: [
      "Chegar na motivação EMOCIONAL profunda",
      "Quantificar a dor: 'como isso afeta seu dia a dia?'",
      "Calcular ROI emocional/profissional",
      "Mapear cenário ideal da paciente",
      "Criar visão de futuro transformada",
    ],
    red_flags: [
      "Ficar na superfície (queixas estéticas apenas)",
      "Não conectar procedimento com vida/carreira",
      "Assumir motivações sem perguntar",
    ],
  },
  
  presentation: {
    weight: 15,
    criteria: [
      "Benefícios antes de características",
      "Personalizar apresentação para DOR específica da paciente",
      "Usar storytelling: 'pacientes como você geralmente...'",
      "Demonstrar autoridade técnica sem jargão",
      "Conectar procedimento com transformação de vida",
    ],
    red_flags: [
      "Listar especificações técnicas sem contexto",
      "Falar em 'ml de silicone' em vez de resultado",
      "Apresentação genérica (copiar/colar)",
    ],
  },
  
  technical_objection: {
    weight: 10,
    criteria: [
      "Responder com evidência (dados, estudos, experiência)",
      "Validar a preocupação antes de responder",
      "Diferenciar medo legítimo de mito",
      "Oferecer ver cases reais (antes/depois)",
      "Nunca prometer resultado 100% garantido",
    ],
    red_flags: [
      "Minimizar riscos cirúrgicos",
      "Prometer resultado exato",
      "Não saber responder questão técnica básica",
      "Fazer diagnóstico médico (papel do cirurgião)",
    ],
  },
  
  closing: {
    weight: 10,
    criteria: [
      "Próximo passo natural (não forçado)",
      "Trial close ao longo da conversa",
      "Criar urgência genuína (agenda, recuperação, evento)",
      "Facilitar decisão (remover obstáculos)",
      "Confirmar comprometimento com follow-up",
    ],
    red_flags: [
      "Pressão explícita ('mas é agora ou nunca')",
      "Deixar conversa sem próximo passo definido",
      "Aceitar 'vou pensar' sem qualificar",
      "Forçar agendamento sem rapport suficiente",
    ],
  },
};

// ==================== GERADOR DE CENÁRIOS POR IA ====================
const SCENARIO_GENERATOR_PROMPT = `Gere um cenário realista de atendimento em clínica de cirurgia plástica para treinamento de vendas consultivas.

PARÂMETROS:
- Nível: {{level}} (1=Fundamentos, 2=High Ticket, 3=Premium, 4=LTV)
- Competência principal: {{competency}}
- Procedimento: {{procedure}}

FORMATO DE SAÍDA (JSON):
{
  "patient_name": "<nome brasileiro realista>",
  "patient_age": <idade>,
  "patient_profession": "<profissão>",
  "patient_profile": "<perfil psicológico em 2 frases>",
  "scenario": "<descrição do cenário em 3-4 frases>",
  "patient_says": "<fala da paciente que inicia o cenário>",
  "question": "<pergunta avaliativa para o aluno>",
  "options": [
    {"text": "<opção A>", "score": <0-10>, "feedback": "<por que esta nota>"},
    {"text": "<opção B>", "score": <0-10>, "feedback": "<por que esta nota>"},
    {"text": "<opção C>", "score": <0-10>, "feedback": "<por que esta nota>"}
  ],
  "competencies_tested": ["<comp1>", "<comp2>"],
  "ideal_response": "<resposta modelo perfeita>"
}

REGRAS:
1. Cenários devem ser AMBÍGUOS - duas opções podem parecer boas, mas uma é melhor
2. Evitar opções obviamente erradas (tipo rude ou ignorante)
3. Usar linguagem brasileira real (não formal demais)
4. Incluir nuances emocionais do paciente
5. Variar entre gêneros, idades e perfis socioeconômicos`;

export {
  SYSTEM_PROMPT_EVALUATOR,
  LEVEL_PROMPTS,
  SIMULATION_PATIENT_PROMPT,
  COMPETENCY_RUBRICS,
  SCENARIO_GENERATOR_PROMPT,
  exampleAPICall,
};
