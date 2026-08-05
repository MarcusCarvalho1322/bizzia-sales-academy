/* ============================================================
   BIZZ.IA SALES ACADEMY — Cursos, competencias e usuarios de demonstracao
   COURSES = 4 niveis de certificacao. COMP_LABELS = 12 competencias.
   Conteudo migrado verbatim do v5 unificado. NAO reescrever.
   ============================================================ */

// Contas de demonstracao. Em producao, autenticacao real via NextAuth + Neon.
export const USERS_DB = [
  {id:"u1",email:"marcus@bizzia.com",  pass:"bizzia2026",name:"Marcus Cardoso",    role:"manager",org:"BIZZ.IA",        plan:"pro"},
  {id:"u2",email:"gestor@clinica.com", pass:"gestor123", name:"Ana Paula Gestora", role:"manager",org:"ProntoMED",      plan:"pro"},
  {id:"u3",email:"carol@clinica.com",  pass:"carol123",  name:"Caroline Silva",    role:"student",org:"ProntoMED",      plan:"pro"},
  {id:"u4",email:"juliana@clinica.com",pass:"juliana123",name:"Juliana Mendes",    role:"student",org:"ProntoMED",      plan:"essencial"},
  {id:"u5",email:"rafael@clinica.com", pass:"rafael123", name:"Rafael Costa",      role:"student",org:"ProntoMED",      plan:"essencial"},
  {id:"u6",email:"demo@bizzia.com",    pass:"demo123",   name:"Demo Aluno",        role:"student",org:"BIZZ.IA",        plan:"pro"},
  {id:"u7",email:"pro@bizzia.com",     pass:"pro123",    name:"Demo Pro",          role:"student",org:"BIZZ.IA",        plan:"pro"},
];

// Faixas de valor: referencia de posicionamento de mercado, nao tabela de precos.
export const COURSES = [
  {id:1,level:1,title:"FUNDAMENTOS", subtitle:"Atendimento & Primeiros Contatos",range:"R$ 3–8k",  color:"#B87333",passing:70,mins:25},
  {id:2,level:2,title:"HIGH TICKET", subtitle:"Procedimentos de Alto Valor",      range:"R$10–25k", color:"#D4A853",passing:75,mins:25},
  {id:3,level:3,title:"PREMIUM",     subtitle:"Cliente VIP & Ticket Máximo",      range:"R$25–80k", color:"#C0C0C0",passing:80,mins:25},
  {id:4,level:4,title:"LTV MASTER",  subtitle:"Carteira Vitalícia & Referências", range:"R$100k+",  color:"#E8D5B7",passing:85,mins:25},
];

export const COMP_LABELS = {
  rapport:"Rapport & Acolhimento",     price:"Objeção de Preço",
  discovery:"Descoberta de Necessidades", presentation:"Apresentação de Valor",
  objection:"Manejo de Objeções",      closing:"Fechamento",
  followup:"Follow-up",                ethics:"Ética & Discrição",
  ltv:"Gestão de LTV",                 reactivation:"Reativação",
  upsell:"Cross-sell & Upsell",        referral:"Captação de Referências",
};
