"use client";

/* =============================================================
   BIZZ.IA SALES ACADEMY v5.0 — Aplicacao Unificada
   Modulo 1: Exames (205 questoes, 4 niveis, shuffleOptions)
   Modulo 2: Simulacao IA (12 perfis, Claude API, avaliacao ao vivo)
   Planos: Essencial (exames) | Pro (exames + simulacao IA)

   MIGRACAO (ver docs/RELATORIO-COMPLIANCE.md):
   - Conteudo de questoes e perfis movido para lib/, sem reescrita.
   - Design system movido para app/globals.css.
   - Persistencia via localStorage (window.storage nao existe no navegador).
   - Toda chamada a IA passa por /api/simulate. Nenhuma chave no cliente.
   ============================================================= */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { USERS_DB, COURSES, COMP_LABELS } from "@/lib/courses";
import { QB } from "@/lib/questions";
import { MATERIAL } from "@/lib/material";
import { PATIENT_PROFILES } from "@/lib/patient-profiles";

/* ── Conformidade — avisos exibidos na interface ──────────────
   Dossie Mestre §4.3 e §4.4. Nao remover sem parecer juridico. */
export const AVISO_CENARIO = "Cenário de treinamento. Profissional fictício.";
export const AVISO_VALOR = "Valor ilustrativo para fins de treinamento.";
export const VERSAO_TERMOS = "2026-08-05";
const CONSENT_KEY = "bizzia_academy_consent";

function consentGiven() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    return JSON.parse(raw).version === VERSAO_TERMOS;
  } catch { return false; }
}

function recordConsent() {
  // Timestamp do aceite. Persistencia definitiva no Neon quando o banco
  // for provisionado — ver prisma/schema.prisma (model TermsAcceptance).
  const record = { version: VERSAO_TERMOS, acceptedAt: new Date().toISOString() };
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch {}
  return record;
}

// Iniciais da persona — substitui o avatar de emoji (design system §5.4).
function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── STORAGE ───────────────────────────────────────────────────────────
const SK = "bizzia_academy_v5";
function loadData() {
  if (typeof window === "undefined") return null;
  try { const raw = window.localStorage.getItem(SK); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveData(d) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SK, JSON.stringify(d)); } catch {}
}
function initData() { return { users: USERS_DB, results: {}, simResults: {}, session: null }; }

// ── CLAUDE API ────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt, userKey) {
  const resp = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(userKey ? { "x-academy-user": userKey } : {}) },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "API error");
  return data.text || "";
}

async function simulateTurn({ profile, history, studentMessage, turnNumber, totalTurns, userKey }) {
  const systemPrompt = `Você é um simulador de treinamento de vendas para clínicas de estética.

PERFIL DA PACIENTE QUE VOCÊ INTERPRETA:
- Nome: ${profile.name}, ${profile.age} anos
- Procedimento: ${profile.procedure}
- Personalidade: ${profile.personality}
- Motivação real: ${profile.real_motivation}
- Principal objeção: ${profile.main_objection}
- Contexto: ${profile.context}

REGRAS:
1. Responda COMO a paciente responderia de verdade — com emoção, hesitação ou abertura conforme o perfil
2. Evolua: se a recepcionista foi bem, demonstre abrindo mais; se foi mal, feche
3. Turno ${turnNumber} de ${totalTurns}. ${turnNumber >= totalTurns ? "Último turno — conclua a conversa conforme como foi conduzida." : "Continue naturalmente."}
4. Esta persona é FICTÍCIA e existe apenas para treinamento. Nunca cite um médico real, nunca invente número de CRM, registro profissional ou credencial verificável. Refira-se ao cirurgião apenas como "a Dra." ou "o Dr. [Cirurgião Responsável]".
5. Se mencionar valores, trate-os como ilustrativos. Não afirme resultado clínico garantido nem estatística de desempenho sem fonte.

RESPONDA APENAS EM JSON VÁLIDO sem markdown:
{
  "patient_message": "o que a paciente diz agora (1-3 frases)",
  "evaluation": {
    "competency": "rapport|price|discovery|presentation|objection|closing|ethics|ltv|reactivation|referral",
    "score": 0-10,
    "feedback": "avaliação objetiva de 2 frases",
    "good": "o que foi bem (1 frase, ou vazio)",
    "improve": "o que melhorar (1 frase)",
    "exemplary": "como seria uma resposta exemplar (1-2 frases)"
  },
  "session_complete": ${turnNumber >= totalTurns ? "true" : "false"}
}`;

  const msgs = [
    ...history,
    { role: "user", content: `A recepcionista disse: "${studentMessage}"` },
  ];
  const raw = await callClaude(msgs, systemPrompt, userKey);
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return {
      patient_message: "Hmm, pode repetir? Não entendi bem.",
      evaluation: { competency:"rapport", score:5, feedback:"Resposta processada com limitação técnica.", good:"", improve:"Seja mais clara e direta.", exemplary:"Uma resposta exemplar criaria conexão genuína antes de qualquer informação." },
      session_complete: turnNumber >= totalTurns,
    };
  }
}

// ── EXAM HELPERS ──────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function shuffleOptions(q) {
  const order = shuffle(q.o.map((_,i)=>i));
  return { ...q, o: order.map(i=>q.o[i]), c: order.indexOf(q.c) };
}

function getExamQuestions(level) {
  return shuffle(QB[level]||[]).slice(0,30).map(shuffleOptions);
}

function fmtTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }

function scoreColor(s) {
  if (s>=8) return "#5BB85B";
  if (s>=6) return "#D4A853";
  if (s>=4) return "#D4895A";
  return "#C0392B";
}
function scoreLabel(s) {
  if (s>=9) return "EXCELENTE";
  if (s>=7) return "BOM";
  if (s>=5) return "REGULAR";
  if (s>=3) return "FRACO";
  return "CRÍTICO";
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function SalesAcademy() {
  const [appData, setAppData]   = useState(null);
  const [view, setView]         = useState("loading");
  const [activeTab, setActiveTab] = useState("exams"); // "exams" | "sim"

  // Exam state
  const [examLevel, setExamLevel]     = useState(null);
  const [examQs, setExamQs]           = useState([]);
  const [examIdx, setExamIdx]         = useState(0);
  const [examAnswers, setExamAnswers] = useState([]);
  const [examTimer, setExamTimer]     = useState(25*60);
  const [examStarted, setExamStarted] = useState(false);
  const [selected, setSelected]       = useState(null);

  // Simulation state
  const [simLevel, setSimLevel]       = useState(null);
  const [simProfile, setSimProfile]   = useState(null);
  const [simHistory, setSimHistory]   = useState([]);
  const [simChat, setSimChat]         = useState([]);
  const [simTurn, setSimTurn]         = useState(0);
  const [simInput, setSimInput]       = useState("");
  const [simLoading, setSimLoading]   = useState(false);
  const [simScores, setSimScores]     = useState([]);
  const [simError, setSimError]       = useState("");

  // Auth
  const [loginEmail, setLoginEmail]   = useState("");
  const [loginPass, setLoginPass]     = useState("");
  const [loginErr, setLoginErr]       = useState("");
  const [mgStudent, setMgStudent]     = useState(null);

  // Aceite LGPD (§4.5)
  const [consentChecked, setConsentChecked] = useState(false);

  const timerRef  = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    {
      const d = loadData();
      const data = d || initData();
      data.users = USERS_DB;
      if (!data.results) data.results = {};
      if (!data.simResults) data.simResults = {};
      setAppData(data);
      setView(data.session ? "dashboard" : consentGiven() ? "login" : "consent");
    }
  }, []);

  useEffect(() => {
    if (view==="simulation") chatEndRef.current?.scrollIntoView({behavior:"smooth"});
  }, [simChat, simLoading]);

  const save = useCallback((d) => { saveData(d); setAppData({...d}); }, []);

  // ── AUTH ──
  function doLogin() {
    const user = appData.users.find(u => u.email===loginEmail.trim() && u.pass===loginPass);
    if (!user) { setLoginErr("E-mail ou senha inválidos."); return; }
    const session = {userId:user.id, role:user.role, name:user.name, org:user.org, plan:user.plan};
    save({...appData, session});
    setLoginErr("");
    setView("dashboard");
  }
  function doLogout() {
    save({...appData, session:null});
    setView("login"); setLoginEmail(""); setLoginPass("");
  }

  // ── EXAM ──
  useEffect(() => {
    if (view==="exam" && examStarted) {
      timerRef.current = setInterval(() => {
        setExamTimer(t => {
          if (t<=1) { clearInterval(timerRef.current); finishExam(true); return 0; }
          return t-1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, examStarted]);

  function startExam(levelId) {
    setExamLevel(levelId);
    setExamQs(getExamQuestions(levelId));
    setExamIdx(0); setExamAnswers([]); setExamTimer(25*60);
    setExamStarted(false); setSelected(null);
    setView("exam-intro");
  }
  function beginExam() { setExamStarted(true); setView("exam"); }
  function answerQuestion(i) { if (selected===null) setSelected(i); }
  function nextQuestion() {
    if (selected===null) return;
    const newAns = [...examAnswers, {qi:examIdx, chosen:selected, correct:examQs[examIdx].c}];
    if (examIdx+1>=examQs.length) { finishExam(false, newAns); }
    else { setExamAnswers(newAns); setExamIdx(examIdx+1); setSelected(null); }
  }
  function finishExam(expired=false, answers=null) {
    clearInterval(timerRef.current);
    const ans = answers||examAnswers;
    const correct = ans.filter(a=>a.chosen===a.correct).length;
    const pct = Math.round((correct/examQs.length)*100);
    const course = COURSES.find(c=>c.id===examLevel);
    const result = {score:correct, total:examQs.length, pct, passed:pct>=course.passing,
      date:new Date().toLocaleDateString("pt-BR"), timeTaken:25*60-examTimer,
      expired, answers:ans, questions:examQs};
    const uid = appData.session.userId;
    const nd = {...appData, results:{...appData.results,
      [uid]:{...(appData.results[uid]||{}),[examLevel]:result}}};
    save(nd); setView("exam-results");
  }

  // ── SIMULATION ──
  function startSim(levelId, profile) {
    setSimLevel(levelId); setSimProfile(profile);
    setSimTurn(0); setSimScores([]); setSimError(""); setSimInput("");
    setSimChat([{role:"patient", text:profile.opening, turn:0}]);
    setSimHistory([{role:"assistant", content:profile.opening}]);
    setView("simulation");
  }

  async function sendResponse() {
    if (!simInput.trim() || simLoading) return;
    const studentText = simInput.trim();
    setSimInput(""); setSimLoading(true); setSimError("");
    const turn = simTurn+1;
    const newChat = [...simChat, {role:"student", text:studentText, turn}];
    setSimChat(newChat);
    try {
      const result = await simulateTurn({
        profile:simProfile, history:simHistory,
        studentMessage:studentText, turnNumber:turn, totalTurns:simProfile.turns,
        userKey: appData.session?.userId,
      });
      const newHistory = [...simHistory,
        {role:"user", content:`A recepcionista disse: "${studentText}"`},
        {role:"assistant", content:result.patient_message},
      ];
      const newScores = [...simScores, {turn, studentMessage:studentText, ...result.evaluation}];
      const updatedChat = [...newChat, {role:"patient", text:result.patient_message, turn, evaluation:result.evaluation}];
      setSimHistory(newHistory); setSimScores(newScores);
      setSimTurn(turn); setSimChat(updatedChat);
      if (result.session_complete || turn>=simProfile.turns) {
        const avgScore = Math.round(newScores.reduce((a,s)=>a+s.score,0)/newScores.length);
        const simResult = {profileId:simProfile.id, profileName:simProfile.name,
          procedure:simProfile.procedure, levelId:simLevel, avgScore,
          scores:newScores, date:new Date().toLocaleDateString("pt-BR"), passed:avgScore>=7};
        const uid = appData.session.userId;
        const existing = appData.simResults[uid]||[];
        save({...appData, simResults:{...appData.simResults,[uid]:[...existing, simResult]}});
        setTimeout(()=>setView("sim-results"), 600);
      }
    } catch(err) {
      setSimError(err?.message || "Nao foi possivel falar com a IA. Tente novamente em instantes.");
    } finally { setSimLoading(false); }
  }

  const S = appData?.session;

  // ──────────────────────────────────────────────────────────────────
  //  VIEWS
  // ──────────────────────────────────────────────────────────────────

  if (view==="loading") return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="cinzel" style={{color:"#B87333",fontSize:18,letterSpacing:4}}>CARREGANDO...</div>
    </div>
  );

  // ── ACEITE LGPD ────────────────────────────────────────────────────
  // Obrigatorio no primeiro acesso. Dossie Mestre §4.5.
  // O timestamp e registrado aqui; a persistencia definitiva vai para o
  // Neon quando o banco for provisionado (prisma/schema.prisma).
  if (view==="consent") return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="fade" style={{width:"100%",maxWidth:560}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div className="cinzel" style={{fontSize:11,letterSpacing:8,color:"#B87333",marginBottom:12}}>BIZZ.IA</div>
          <div className="cinzel" style={{fontSize:26,fontWeight:700,color:"#F0EDE8",letterSpacing:3}}>SALES ACADEMY</div>
          <div style={{width:60,height:1,background:"#B87333",margin:"18px auto"}}/>
        </div>

        <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:36}}>
          <div className="cinzel" style={{fontSize:10,letterSpacing:4,color:"#B87333",marginBottom:20}}>ANTES DE COMEÇAR</div>

          <div style={{color:"#F0EDE8",fontSize:16,lineHeight:1.8,marginBottom:22}}>
            Esta plataforma registra seu desempenho em exames e simulações para
            que você e a gestão da sua clínica acompanhem sua evolução profissional.
          </div>

          <div style={{background:"#111",borderRadius:10,padding:"16px 18px",marginBottom:22}}>
            <div className="cinzel" style={{fontSize:9,letterSpacing:3,color:"#5A5248",marginBottom:10}}>O QUE VOCÊ PRECISA SABER</div>
            <div style={{color:"#998E82",fontSize:14,lineHeight:1.8}}>
              As conversas de simulação acontecem com <em>pacientes fictícias</em>.
              Nenhum dado de paciente real deve ser inserido no sistema.<br/>
              Seus resultados são visíveis para você e para a gestão da sua clínica.<br/>
              Operamos com os subprocessadores Anthropic, Neon e Vercel.
            </div>
          </div>

          <div style={{display:"flex",gap:14,marginBottom:26,fontSize:14,color:"#998E82"}}>
            <Link href="/privacidade">Política de Privacidade</Link>
            <span style={{color:"#1F1A15"}}>·</span>
            <Link href="/termos">Termos de Uso</Link>
          </div>

          <label style={{display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",marginBottom:24}}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={e=>setConsentChecked(e.target.checked)}
              style={{width:18,height:18,marginTop:3,flexShrink:0,accentColor:"#B87333",padding:0}}
            />
            <span style={{color:"#F0EDE8",fontSize:15,lineHeight:1.7}}>
              Li e aceito a Política de Privacidade e os Termos de Uso.
            </span>
          </label>

          <button
            onClick={()=>{ if(!consentChecked) return; recordConsent(); setView("login"); }}
            disabled={!consentChecked}
            style={{width:"100%",padding:"15px",
              background:consentChecked?"linear-gradient(135deg,#B87333,#D4A853)":"#1A1A1A",
              color:consentChecked?"#000":"#5A5248",
              borderRadius:8,fontSize:13,letterSpacing:3,fontWeight:700}}>
            ACEITAR E CONTINUAR
          </button>
        </div>

        <div style={{textAlign:"center",marginTop:16,color:"#5A5248",fontSize:12}}>
          Versão dos termos: {VERSAO_TERMOS}
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────
  if (view==="login") return (
    <div style={{background:"#000",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="fade" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div className="cinzel" style={{fontSize:11,letterSpacing:8,color:"#B87333",marginBottom:12}}>BIZZ.IA</div>
          <div className="cinzel" style={{fontSize:30,fontWeight:700,color:"#F0EDE8",letterSpacing:3,lineHeight:1.2}}>SALES<br/>ACADEMY</div>
          <div style={{width:60,height:1,background:"#B87333",margin:"18px auto"}}/>
          <div style={{color:"#998E82",fontSize:13,letterSpacing:2}}>EXCELÊNCIA EM VENDAS DE ESTÉTICA</div>
        </div>
        <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:36}}>
          {[["E-MAIL","email",loginEmail,setLoginEmail,"seu@email.com"],
            ["SENHA","password",loginPass,setLoginPass,"••••••••"]].map(([label,type,val,set,ph])=>(
            <div key={label} style={{marginBottom:20}}>
              <div className="cinzel" style={{color:"#998E82",fontSize:10,letterSpacing:3,marginBottom:8}}>{label}</div>
              <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type}
                onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
            </div>
          ))}
          {loginErr && <div style={{color:"#C0392B",fontSize:13,marginBottom:14,textAlign:"center"}}>{loginErr}</div>}
          <button onClick={doLogin} style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#B87333,#D4A853)",color:"#000",borderRadius:8,fontSize:13,letterSpacing:3,fontWeight:700}}>ENTRAR</button>
        </div>
        <div style={{textAlign:"center",marginTop:16,color:"#5A5248",fontSize:12,lineHeight:1.8}}>
          demo@bizzia.com / demo123 &nbsp;(Pro)<br/>
          juliana@clinica.com / juliana123 &nbsp;(Essencial)
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──────────────────────────────────────────────────────
  if (view==="dashboard") {
    const userResults = appData.results[S?.userId]||{};
    const userSimResults = appData.simResults[S?.userId]||[];
    const isPro = S?.plan==="pro";

    return (
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:36}}>
            <div>
              <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:"#B87333",marginBottom:4}}>BIZZ.IA</div>
              <div className="cinzel" style={{fontSize:22,color:"#F0EDE8",fontWeight:700,letterSpacing:2}}>SALES ACADEMY</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {/* Plan badge */}
              <div style={{background:isPro?"#B8733322":"#1A1A1A",border:`1px solid ${isPro?"#B87333":"#1F1A15"}`,borderRadius:20,padding:"4px 14px"}}>
                <span className="cinzel" style={{fontSize:10,letterSpacing:3,color:isPro?"#B87333":"#5A5248"}}>{isPro?"PRO":"ESSENCIAL"}</span>
              </div>
              {S?.role==="manager" && (
                <button onClick={()=>setView("manager")} style={{background:"#0A0A0A",border:"1px solid #B87333",color:"#B87333",borderRadius:8,padding:"8px 16px",fontSize:11,letterSpacing:2}}>GESTOR</button>
              )}
              <button onClick={doLogout} style={{background:"#0A0A0A",border:"1px solid #1F1A15",color:"#998E82",borderRadius:8,padding:"8px 16px",fontSize:11,letterSpacing:2}}>SAIR</button>
            </div>
          </div>

          <div style={{marginBottom:32}}>
            <div style={{fontSize:24,fontStyle:"italic",color:"#F0EDE8",marginBottom:4}}>Olá, {S?.name?.split(" ")[0]}.</div>
            <div style={{color:"#998E82",fontSize:14}}>Sua jornada para excelência em vendas consultivas de estética.</div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,background:"#0A0A0A",borderRadius:12,padding:4,marginBottom:32,width:"fit-content"}}>
            {[["exams","EXAMES"],["sim",isPro?"SIMULAÇÃO IA":"SIMULAÇÃO IA · PRO"]].map(([key,label])=>(
              <button key={key} onClick={()=>setActiveTab(key)} style={{
                padding:"10px 24px",borderRadius:10,fontSize:11,letterSpacing:2,fontWeight:700,
                background:activeTab===key?"#1A1A1A":"transparent",
                color:activeTab===key?"#B87333":"#5A5248",
                border:activeTab===key?"1px solid #1F1A15":"1px solid transparent",
              }}>{label}</button>
            ))}
          </div>

          {/* ── TAB: EXAMES ── */}
          {activeTab==="exams" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:18,marginBottom:32}}>
                {COURSES.map((c,i)=>{
                  const res = userResults[c.id];
                  const prevDone = i===0||userResults[COURSES[i-1].id]?.passed;
                  const locked = i>0&&!prevDone;
                  return (
                    <div key={c.id} className="fade" style={{background:"#0A0A0A",border:`1px solid ${res?.passed?c.color:locked?"#1A1A1A":"#1F1A15"}`,borderRadius:16,padding:26,opacity:locked?.5:1,position:"relative"}}>
                      {res?.passed && <div style={{position:"absolute",top:14,right:14,background:c.color,borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#000"}}>✓</div>}
                      {/* O botao ja diz BLOQUEADO; a marca no canto seria redundante. */}
                      <div className="cinzel" style={{fontSize:10,letterSpacing:4,color:c.color,marginBottom:10}}>NÍVEL {c.level}</div>
                      <div className="cinzel" style={{fontSize:15,color:"#F0EDE8",fontWeight:700,marginBottom:4}}>{c.title}</div>
                      <div style={{color:"#998E82",fontSize:12,marginBottom:4}}>{c.subtitle}</div>
                      {/* Conformidade §4.4 — faixa e referencia de posicionamento,
                          nao tabela de precos. Valores ilustrativos. */}
                      <div className="cinzel" style={{color:c.color,fontSize:11,marginBottom:4}}>{c.range}</div>
                      <div style={{color:"#5A5248",fontSize:11,marginBottom:16,fontStyle:"italic"}}>{AVISO_VALOR}</div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#5A5248",marginBottom:14}}>
                        <span>{QB[c.id]?.length}+ q</span><span>25 min</span><span>Mín.{c.passing}%</span>
                      </div>
                      {res?.pct!==undefined && (
                        <div style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,color:"#998E82"}}>
                            <span>Melhor</span>
                            <span style={{color:res.passed?"#5BB85B":"#C0392B",fontWeight:600}}>{res.pct}%</span>
                          </div>
                          <div style={{background:"#1A1A1A",borderRadius:4,height:4}}>
                            <div style={{background:res.passed?"#5BB85B":"#C0392B",width:`${res.pct}%`,height:4,borderRadius:4,transition:"width 1s"}}/>
                          </div>
                        </div>
                      )}
                      <button onClick={()=>!locked&&startExam(c.id)} disabled={locked} style={{width:"100%",padding:"11px 0",background:locked?"#1A1A1A":res?.passed?"transparent":`linear-gradient(135deg,${c.color},#D4A853)`,border:res?.passed?`1px solid ${c.color}`:"none",color:locked?"#5A5248":res?.passed?c.color:"#000",borderRadius:8,fontSize:11,letterSpacing:2,fontWeight:700,cursor:locked?"not-allowed":"pointer"}}>
                        {locked?"BLOQUEADO":res?.passed?"REFAZER":"INICIAR"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB: SIMULAÇÃO ── */}
          {activeTab==="sim" && (
            <div>
              {!isPro ? (
                /* UPGRADE WALL */
                <div className="fade" style={{background:"linear-gradient(135deg,#0A0800,#0F0A00)",border:"2px solid #B87333",borderRadius:20,padding:48,textAlign:"center",maxWidth:560,margin:"0 auto"}}>
                  <div className="cinzel" style={{fontSize:11,letterSpacing:6,color:"#B87333",marginBottom:16}}>PLANO PRO</div>
                  <div className="cinzel" style={{fontSize:22,color:"#F0EDE8",fontWeight:700,marginBottom:12}}>Simulação com IA</div>
                  <div style={{color:"#998E82",fontSize:16,lineHeight:1.7,marginBottom:28}}>
                    Pratique com pacientes virtuais que respondem com emoção real,
                    resistem, comparam preços e testam suas habilidades —
                    exatamente como no dia a dia da clínica.
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,textAlign:"left",maxWidth:320,margin:"0 auto 28px"}}>
                    {["12 perfis de pacientes reais por nível","Avaliação por competência em tempo real","Transcrição comentada turno a turno","Certificado de simulação IA"].map(f=>(
                      <div key={f} style={{display:"flex",gap:10,alignItems:"center",color:"#F0EDE8",fontSize:14}}>
                        <div style={{color:"#B87333",fontSize:16}}>✦</div>{f}
                      </div>
                    ))}
                  </div>
                  <div style={{color:"#5A5248",fontSize:13}}>Fale com seu gestor para ativar o Plano Pro.</div>
                </div>
              ) : (
                /* PERFIS POR NÍVEL */
                <div>
                  {COURSES.map(course => {
                    const profiles = PATIENT_PROFILES[course.id]||[];
                    const examPassed = (appData.results[S?.userId]||{})[course.id]?.passed;
                    const simsDone = userSimResults.filter(s=>s.levelId===course.id);
                    return (
                      <div key={course.id} style={{marginBottom:36}}>
                        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                          <div style={{width:4,height:44,background:course.color,borderRadius:2}}/>
                          <div>
                            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:course.color}}>{course.title}</div>
                            <div style={{color:"#998E82",fontSize:13}}>{course.subtitle}</div>
                          </div>
                          {!examPassed && (
                            <div style={{marginLeft:"auto",background:"#1A1A1A",border:"1px solid #2A2A2A",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#5A5248",fontFamily:"Cinzel,serif",letterSpacing:1}}>
                              Complete o exame primeiro
                            </div>
                          )}
                          {examPassed && <div style={{marginLeft:"auto",color:"#5A5248",fontSize:12}}>{simsDone.length} simulações feitas</div>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:16}}>
                          {profiles.map(profile=>{
                            const done = userSimResults.filter(s=>s.profileId===profile.id);
                            const best = done.length>0?Math.max(...done.map(s=>s.avgScore)):null;
                            const locked = !examPassed;
                            return (
                              <div key={profile.id} style={{background:"#0A0A0A",border:`1px solid ${best>=7?"#5BB85B33":locked?"#1A1A1A":"#1F1A15"}`,borderRadius:16,padding:22,opacity:locked?.45:1,position:"relative"}}>
                                {best!==null&&<div style={{position:"absolute",top:12,right:12,background:scoreColor(best),borderRadius:20,padding:"2px 10px",fontSize:11,fontFamily:"Cinzel,serif",color:"#000",fontWeight:700}}>{best}/10</div>}
                                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                                  <div className="cinzel" style={{width:30,height:30,borderRadius:"50%",background:"#111",border:"1px solid #1F1A15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#998E82"}}>{initials(profile.name)}</div>
                                  <div style={{background:profile.diffColor+"22",border:`1px solid ${profile.diffColor}44`,borderRadius:20,padding:"2px 10px",fontSize:10,color:profile.diffColor,fontFamily:"Cinzel,serif",letterSpacing:1}}>{profile.difficulty}</div>
                                </div>
                                <div className="cinzel" style={{fontSize:13,color:"#F0EDE8",fontWeight:700,marginBottom:4}}>{profile.name}</div>
                                <div className="cinzel" style={{color:course.color,fontSize:11,marginBottom:6,letterSpacing:1}}>{profile.procedure}</div>
                                <div style={{color:"#5A5248",fontSize:12,fontStyle:"italic",lineHeight:1.5,marginBottom:12}}>
                                  "{profile.opening.substring(0,72)}..."
                                </div>
                                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                                  {profile.competencies.map(c=>(
                                    <span key={c} style={{background:"#1A1A1A",borderRadius:20,padding:"2px 8px",fontSize:10,color:"#5A5248"}}>{COMP_LABELS[c]?.split(" ")[0]}</span>
                                  ))}
                                </div>
                                <div style={{color:"#5A5248",fontSize:11,marginBottom:14}}>{profile.turns} turnos · IA ao vivo</div>
                                <button onClick={()=>!locked&&startSim(course.id,profile)} disabled={locked} style={{width:"100%",padding:"11px 0",background:locked?"#1A1A1A":`linear-gradient(135deg,${course.color},#D4A853)`,color:locked?"#5A5248":"#000",borderRadius:8,fontSize:11,letterSpacing:2,fontWeight:700,cursor:locked?"not-allowed":"pointer"}}>
                                  {locked?"EXAME PRIMEIRO":best!==null?"REFAZER":"SIMULAR AGORA"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Stats bar */}
          {(Object.keys(appData.results[S?.userId]||{}).length>0 || userSimResults.length>0) && (
            <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:14,padding:"20px 24px",marginTop:32,display:"flex",gap:32,flexWrap:"wrap"}}>
              {[
                ["Exames realizados", Object.keys(appData.results[S?.userId]||{}).length],
                ["Exames aprovados", Object.values(appData.results[S?.userId]||{}).filter(r=>r.passed).length],
                ...(isPro?[["Simulações IA", userSimResults.length],["Média IA", userSimResults.length>0?`${Math.round(userSimResults.reduce((a,s)=>a+s.avgScore,0)/userSimResults.length)}/10`:"–"]]:[] ),
              ].map(([k,v])=>(
                <div key={k}>
                  <div style={{color:"#5A5248",fontSize:10,letterSpacing:2,fontFamily:"Cinzel,serif"}}>{k.toUpperCase()}</div>
                  <div className="cinzel" style={{fontSize:24,color:"#B87333",fontWeight:900}}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Rodape LGPD — §4.5 */}
          <div style={{marginTop:44,paddingTop:22,borderTop:"1px solid #1F1A15",display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
            <Link href="/privacidade" style={{fontSize:13,color:"#5A5248"}}>Política de Privacidade</Link>
            <span style={{color:"#1F1A15"}}>·</span>
            <Link href="/termos" style={{fontSize:13,color:"#5A5248"}}>Termos de Uso</Link>
            <span className="disclaimer" style={{marginLeft:"auto"}}>{AVISO_CENARIO}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM INTRO ─────────────────────────────────────────────────────
  if (view==="exam-intro") {
    const course = COURSES.find(c=>c.id===examLevel);
    return (
      <div style={{background:"#000",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div className="fade" style={{maxWidth:540,width:"100%",textAlign:"center"}}>
          <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:course.color,marginBottom:12}}>NÍVEL {course.level}</div>
          <div className="cinzel" style={{fontSize:28,color:"#F0EDE8",fontWeight:700,marginBottom:6}}>{course.title}</div>
          <div style={{color:"#998E82",fontSize:17,fontStyle:"italic",marginBottom:32}}>{course.subtitle}</div>
          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:32,marginBottom:24,textAlign:"left"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
              {[["Questões","30"],["Tempo","25 min"],["Aprovação",`${course.passing}%+`],["Gabarito","Ao final"]].map(([k,v])=>(
                <div key={k}><div className="cinzel" style={{color:"#5A5248",fontSize:10,letterSpacing:2,marginBottom:4}}>{k.toUpperCase()}</div>
                <div className="cinzel" style={{color:"#F0EDE8",fontSize:20,fontWeight:700}}>{v}</div></div>
              ))}
            </div>
            <div style={{background:"#111",borderRadius:8,padding:12,fontSize:13,color:"#998E82",lineHeight:1.7,marginBottom:12}}>
              Cronômetro começa ao clicar INICIAR. Questões consecutivas, sem revisão. Gabarito completo e material ao final.
            </div>
            {/* Conformidade §4.3 e §4.4 */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <span className="disclaimer">{AVISO_CENARIO}</span>
              <span className="disclaimer">{AVISO_VALOR}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setView("dashboard")} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid #1F1A15",color:"#998E82",borderRadius:8,fontSize:12,letterSpacing:2}}>VOLTAR</button>
            <button onClick={beginExam} style={{flex:2,padding:"14px",background:`linear-gradient(135deg,${course.color},#D4A853)`,color:"#000",borderRadius:8,fontSize:13,letterSpacing:3,fontWeight:700}}>INICIAR EXAME</button>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM ───────────────────────────────────────────────────────────
  if (view==="exam") {
    const course = COURSES.find(c=>c.id===examLevel);
    const q = examQs[examIdx];
    const danger = examTimer<300;
    return (
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:760,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div>
              <div className="cinzel" style={{fontSize:10,letterSpacing:4,color:course.color}}>{course.title}</div>
              <div style={{color:"#998E82",fontSize:13}}>Questão {examIdx+1} de {examQs.length}</div>
            </div>
            <div className={danger?"pulse":""} style={{background:danger?"#2A0A0A":"#0A0A0A",border:`2px solid ${danger?"#C0392B":"#1F1A15"}`,borderRadius:12,padding:"10px 20px",textAlign:"center"}}>
              <div className="cinzel" style={{color:danger?"#C0392B":course.color,fontSize:26,fontWeight:900,letterSpacing:2}}>{fmtTime(examTimer)}</div>
              <div style={{color:"#5A5248",fontSize:10,letterSpacing:2}}>RESTANTE</div>
            </div>
          </div>
          <div style={{background:"#1A1A1A",borderRadius:4,height:3,marginBottom:32}}>
            <div style={{background:course.color,width:`${(examIdx/examQs.length)*100}%`,height:3,borderRadius:4,transition:"width .3s"}}/>
          </div>
          <div className="fade" key={examIdx}>
            <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:28,marginBottom:18}}>
              <div className="cinzel" style={{fontSize:10,letterSpacing:3,color:"#5A5248",marginBottom:12}}>SITUAÇÃO</div>
              <div style={{fontSize:17,lineHeight:1.75,color:"#F0EDE8"}}>{q.q}</div>
            </div>
            {q.o.map((opt,i)=>{
              const rv = selected!==null;
              const isC = i===q.c; const isSel = selected===i;
              const bg = !rv?"#0A0A0A":isSel?(isC?"#0A2A0A":"#2A0A0A"):isC&&rv?"#0A2A0A":"#0A0A0A";
              const bc = !rv?"#1F1A15":isSel?(isC?"#5BB85B":"#C0392B"):isC&&rv?"#5BB85B":"#1F1A15";
              const tc = rv&&isC?"#5BB85B":rv&&isSel&&!isC?"#C0392B":"#F0EDE8";
              return (
                <button key={i} onClick={()=>answerQuestion(i)} style={{display:"block",width:"100%",marginBottom:10,background:bg,border:`1px solid ${bc}`,borderRadius:12,padding:"16px 20px",textAlign:"left",cursor:rv?"default":"pointer",color:tc,fontSize:15,lineHeight:1.5,transition:"all .2s"}}>
                  <span className="cinzel" style={{color:"#5A5248",fontSize:10,marginRight:10}}>{String.fromCharCode(65+i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected!==null && (
            <div className="fade" style={{textAlign:"right",marginTop:8}}>
              <button onClick={nextQuestion} style={{background:`linear-gradient(135deg,${course.color},#D4A853)`,color:"#000",borderRadius:8,padding:"13px 32px",fontSize:12,letterSpacing:3,fontWeight:700}}>
                {examIdx+1>=examQs.length?"VER RESULTADO →":"PRÓXIMA →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EXAM RESULTS ───────────────────────────────────────────────────
  if (view==="exam-results") {
    const res = (appData.results[S?.userId]||{})[examLevel];
    if (!res) return null;
    const course = COURSES.find(c=>c.id===examLevel);
    const compMap = {};
    res.questions?.forEach((q,i)=>{
      const a = res.answers?.[i]; if(!a) return;
      if(!compMap[q.k]) compMap[q.k]={correct:0,total:0};
      compMap[q.k].total++;
      if(a.chosen===a.correct) compMap[q.k].correct++;
    });
    return (
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div className="fade" style={{textAlign:"center",padding:"36px 0 28px"}}>
            <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:course.color,marginBottom:12}}>{course.title} — RESULTADO</div>
            <div className="cinzel" style={{fontSize:80,fontWeight:900,color:res.passed?"#5BB85B":"#C0392B",lineHeight:1,marginBottom:10}}>{res.pct}%</div>
            <div className="cinzel" style={{fontSize:20,letterSpacing:4,color:res.passed?"#5BB85B":"#C0392B",marginBottom:8}}>{res.passed?"APROVADO":"NÃO APROVADO"}</div>
            <div style={{color:"#998E82",fontSize:14}}>{res.score}/{res.total} acertos &nbsp;·&nbsp; {Math.floor(res.timeTaken/60)}min {res.timeTaken%60}s</div>
          </div>

          {/* Competências */}
          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:26,marginBottom:22}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:18}}>DESEMPENHO POR COMPETÊNCIA</div>
            {Object.entries(compMap).map(([k,v])=>{
              const p=Math.round(v.correct/v.total*100);
              return(<div key={k} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{color:"#F0EDE8",fontSize:14}}>{COMP_LABELS[k]||k}</div>
                  <div className="cinzel" style={{color:p>=70?"#5BB85B":"#C0392B",fontWeight:700,fontSize:13}}>{v.correct}/{v.total}</div>
                </div>
                <div style={{background:"#1A1A1A",borderRadius:4,height:6}}>
                  <div style={{background:p>=70?"#5BB85B":p>=50?"#D4A853":"#C0392B",width:`${p}%`,height:6,borderRadius:4,transition:"width 1s"}}/>
                </div>
              </div>);
            })}
          </div>

          {/* Gabarito */}
          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:26,marginBottom:22}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:18}}>GABARITO COMENTADO</div>
            {res.questions?.map((q,i)=>{
              const a=res.answers?.[i]; const ok=a?.chosen===a?.correct;
              return(<div key={i} style={{marginBottom:24,paddingBottom:24,borderBottom:i<res.questions.length-1?"1px solid #1A1A1A":"none"}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:ok?"#0A2A0A":"#2A0A0A",border:`1px solid ${ok?"#5BB85B":"#C0392B"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{ok?"✓":"✗"}</div>
                  <div style={{color:"#F0EDE8",fontSize:14,lineHeight:1.6}}><b>{i+1}.</b> {q.q}</div>
                </div>
                {!ok&&a&&<div style={{marginLeft:34,marginBottom:6,padding:"7px 12px",background:"#2A0A0A",borderLeft:"3px solid #C0392B",borderRadius:"0 8px 8px 0",fontSize:13,color:"#C0392B"}}>Sua: {q.o[a.chosen]}</div>}
                {a&&<div style={{marginLeft:34,marginBottom:8,padding:"7px 12px",background:"#0A2A0A",borderLeft:"3px solid #5BB85B",borderRadius:"0 8px 8px 0",fontSize:13,color:"#5BB85B"}}>Correta: {q.o[q.c]}</div>}
                <div style={{marginLeft:34,padding:"9px 12px",background:"#111",borderRadius:8,fontSize:13,color:"#998E82",lineHeight:1.6}}>{q.f}</div>
              </div>);
            })}
          </div>

          {/* Material */}
          <div style={{background:"#0A0A0A",border:`1px solid ${course.color}33`,borderRadius:16,padding:26,marginBottom:22}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:course.color,marginBottom:16}}>MATERIAL DE APROFUNDAMENTO</div>
            <pre style={{whiteSpace:"pre-wrap",fontFamily:"Cormorant Garamond,serif",fontSize:14,color:"#F0EDE8",lineHeight:1.8}}>{MATERIAL[examLevel]}</pre>
          </div>

          {/* Certificado */}
          {res.passed&&<div style={{background:"linear-gradient(135deg,#0A0800,#0F0A00)",border:`2px solid ${course.color}`,borderRadius:16,padding:40,marginBottom:22,textAlign:"center"}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:6,color:course.color,marginBottom:12}}>CERTIFICADO DE CONCLUSÃO</div>
            <div className="cinzel" style={{fontSize:20,color:"#F0EDE8",fontWeight:700,marginBottom:6}}>{S?.name}</div>
            <div style={{color:"#998E82",fontSize:15,marginBottom:16}}>concluiu com {res.pct}% o módulo de<br/><span style={{color:course.color,fontStyle:"italic",fontSize:18}}>{course.title} — {course.subtitle}</span></div>
            <div className="cinzel" style={{color:"#5A5248",fontSize:10,letterSpacing:2}}>BIZZ.IA SALES ACADEMY · {res.date}</div>
          </div>}

          {/* CTA Simulação */}
          {res.passed && S?.plan==="pro" && (
            <div style={{background:"#0A0A0A",border:"1px solid #B87333",borderRadius:14,padding:20,marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <div>
                <div className="cinzel" style={{color:"#B87333",fontSize:11,letterSpacing:3,marginBottom:4}}>SIMULAÇÃO DESBLOQUEADA</div>
                <div style={{color:"#998E82",fontSize:14}}>Agora pratique com pacientes virtuais do nível {course.level}.</div>
              </div>
              <button onClick={()=>{setView("dashboard");setActiveTab("sim");}} style={{padding:"12px 24px",background:"linear-gradient(135deg,#B87333,#D4A853)",color:"#000",borderRadius:8,fontSize:11,letterSpacing:2,fontWeight:700,flexShrink:0}}>IR PARA SIMULAÇÃO</button>
            </div>
          )}

          <div style={{display:"flex",gap:12,justifyContent:"center",paddingBottom:44}}>
            <button onClick={()=>{setView("dashboard");setActiveTab("exams");}} style={{padding:"13px 32px",background:"transparent",border:`1px solid ${course.color}`,color:course.color,borderRadius:8,fontSize:12,letterSpacing:3}}>DASHBOARD</button>
            <button onClick={()=>startExam(examLevel)} style={{padding:"13px 32px",background:`linear-gradient(135deg,${course.color},#D4A853)`,color:"#000",borderRadius:8,fontSize:12,letterSpacing:3,fontWeight:700}}>REFAZER</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIMULATION ─────────────────────────────────────────────────────
  if (view==="simulation" && simProfile) {
    const course = COURSES.find(c=>c.id===simLevel);
    return (
      <div style={{background:"#000",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{background:"#0A0A0A",borderBottom:"1px solid #1F1A15",padding:"12px 20px",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
          <button onClick={()=>setView("dashboard")} style={{background:"transparent",border:"none",color:"#5A5248",fontSize:20}}>←</button>
          <div className="cinzel" style={{width:30,height:30,borderRadius:"50%",background:"#111",border:"1px solid #1F1A15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#998E82",flexShrink:0}}>{initials(simProfile.name)}</div>
          <div>
            <div className="cinzel" style={{fontSize:12,color:"#F0EDE8",fontWeight:700}}>{simProfile.name}</div>
            <div style={{color:"#998E82",fontSize:12}}>{simProfile.procedure}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"right"}}>
              <div className="cinzel" style={{fontSize:9,letterSpacing:3,color:"#5A5248"}}>TURNO</div>
              <div className="cinzel" style={{fontSize:16,color:course.color,fontWeight:700}}>{simTurn} / {simProfile.turns}</div>
            </div>
            <div style={{width:70,background:"#1A1A1A",borderRadius:3,height:5}}>
              <div style={{background:course.color,width:`${(simTurn/simProfile.turns)*100}%`,height:5,borderRadius:3,transition:"width .5s"}}/>
            </div>
          </div>
        </div>
        {/* Context bar */}
        <div style={{background:"#060606",borderBottom:"1px solid #1A1A1A",padding:"8px 20px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{background:simProfile.diffColor+"22",border:`1px solid ${simProfile.diffColor}44`,borderRadius:20,padding:"2px 10px",fontSize:10,color:simProfile.diffColor,fontFamily:"Cinzel,serif",letterSpacing:1}}>{simProfile.difficulty}</div>
          <div style={{color:"#5A5248",fontSize:12}}>Você é a recepcionista. Responda como faria na vida real.</div>
          {/* Conformidade §4.3 — aviso visivel de cenario ficticio. */}
          <div className="disclaimer">{AVISO_CENARIO}</div>
          <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>
            {simProfile.competencies.map(c=>(
              <span key={c} style={{background:"#1A1A1A",borderRadius:20,padding:"2px 8px",fontSize:10,color:"#5A5248"}}>{COMP_LABELS[c]?.split(" ")[0]}</span>
            ))}
          </div>
        </div>
        {/* Chat */}
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,maxWidth:780,width:"100%",margin:"0 auto"}}>
          {simChat.map((msg,i)=>(
            <div key={i} className="fade">
              {msg.role==="patient" && (
                <div style={{display:"flex",gap:10,alignItems:"flex-start",maxWidth:"75%"}}>
                  <div style={{width:34,height:34,background:"#111",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:"Cinzel,serif",color:"#998E82",flexShrink:0}}>{initials(simProfile.name)}</div>
                  <div>
                    <div style={{background:"#0D0D0D",border:"1px solid #1F1A15",borderRadius:"4px 14px 14px 14px",padding:"12px 15px",color:"#F0EDE8",fontSize:15,lineHeight:1.6}}>{msg.text}</div>
                    {msg.evaluation && (
                      <div style={{marginTop:6,background:"#0A0F0A",border:`1px solid ${scoreColor(msg.evaluation.score)}33`,borderRadius:10,padding:"9px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <div className="cinzel" style={{fontSize:17,fontWeight:900,color:scoreColor(msg.evaluation.score)}}>{msg.evaluation.score}/10</div>
                          <div className="cinzel" style={{fontSize:9,color:scoreColor(msg.evaluation.score),letterSpacing:2}}>{scoreLabel(msg.evaluation.score)}</div>
                          <div style={{background:"#1A1A1A",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#5A5248",marginLeft:"auto"}}>{COMP_LABELS[msg.evaluation.competency]}</div>
                        </div>
                        {msg.evaluation.good&&<div style={{color:"#5BB85B",fontSize:12,marginBottom:3}}>✓ {msg.evaluation.good}</div>}
                        {msg.evaluation.improve&&<div style={{color:"#D4A853",fontSize:12,marginBottom:3}}>↗ {msg.evaluation.improve}</div>}
                        {msg.evaluation.exemplary&&<div style={{color:"#998E82",fontSize:12,fontStyle:"italic"}}>{msg.evaluation.exemplary}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {msg.role==="student" && (
                <div style={{display:"flex",gap:10,alignItems:"flex-start",maxWidth:"75%",marginLeft:"auto",flexDirection:"row-reverse"}}>
                  <div style={{width:34,height:34,background:"#B87333",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:"Cinzel,serif",fontWeight:700,color:"#000",flexShrink:0}}>{S?.name?.charAt(0)}</div>
                  <div style={{background:"#1A0D00",border:"1px solid #B8733333",borderRadius:"14px 4px 14px 14px",padding:"12px 15px",color:"#F0EDE8",fontSize:15,lineHeight:1.6}}>{msg.text}</div>
                </div>
              )}
            </div>
          ))}
          {simLoading && (
            <div style={{display:"flex",gap:10}}>
              <div style={{width:34,height:34,background:"#111",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:"Cinzel,serif",color:"#998E82"}}>{initials(simProfile.name)}</div>
              <div style={{background:"#0D0D0D",border:"1px solid #1F1A15",borderRadius:"4px 14px 14px 14px",padding:"12px 18px",color:"#5A5248",fontSize:15}} className="typing">digitando</div>
            </div>
          )}
          {simError && <div style={{background:"#2A0A0A",border:"1px solid #C0392B",borderRadius:10,padding:"10px 14px",color:"#C0392B",fontSize:13}}>{simError}</div>}
          <div ref={chatEndRef}/>
        </div>
        {/* Input */}
        {simTurn<simProfile.turns && (
          <div style={{background:"#0A0A0A",borderTop:"1px solid #1F1A15",padding:"14px 20px",flexShrink:0}}>
            <div style={{maxWidth:780,margin:"0 auto",display:"flex",gap:10,alignItems:"flex-end"}}>
              <div style={{flex:1}}>
                <textarea value={simInput} onChange={e=>setSimInput(e.target.value)} placeholder="Sua resposta como recepcionista..." rows={2}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendResponse();}}}
                  style={{borderRadius:10}}/>
                <div style={{color:"#5A5248",fontSize:11,marginTop:3}}>Enter para enviar · Shift+Enter para nova linha</div>
              </div>
              <button onClick={sendResponse} disabled={simLoading||!simInput.trim()} style={{padding:"13px 24px",background:simLoading||!simInput.trim()?"#1A1A1A":"linear-gradient(135deg,#B87333,#D4A853)",color:simLoading||!simInput.trim()?"#5A5248":"#000",borderRadius:10,fontSize:12,letterSpacing:2,fontWeight:700,flexShrink:0}}>
                {simLoading?"...":"ENVIAR"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SIM RESULTS ────────────────────────────────────────────────────
  if (view==="sim-results" && simProfile) {
    const course = COURSES.find(c=>c.id===simLevel);
    const avgScore = simScores.length>0?Math.round(simScores.reduce((a,s)=>a+s.score,0)/simScores.length):0;
    const compMap = {};
    simScores.forEach(s=>{
      if(!compMap[s.competency]) compMap[s.competency]={sum:0,count:0};
      compMap[s.competency].sum+=s.score; compMap[s.competency].count++;
    });
    return (
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:840,margin:"0 auto"}}>
          <div className="fade" style={{textAlign:"center",padding:"32px 0 24px"}}>
            <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:course.color,marginBottom:10}}>SIMULAÇÃO · {simProfile.name}</div>
            <div className="cinzel" style={{fontSize:78,fontWeight:900,color:scoreColor(avgScore),lineHeight:1,marginBottom:10}}>{avgScore}<span style={{fontSize:30}}>/10</span></div>
            <div className="cinzel" style={{fontSize:18,letterSpacing:4,color:scoreColor(avgScore),marginBottom:6}}>{scoreLabel(avgScore)}</div>
            <div style={{color:"#998E82",fontSize:13}}>{simProfile.procedure} &nbsp;·&nbsp; {simProfile.turns} turnos</div>
          </div>

          {Object.keys(compMap).length>0 && (
            <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:24,marginBottom:20}}>
              <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:16}}>DESEMPENHO POR COMPETÊNCIA</div>
              {Object.entries(compMap).map(([k,v])=>{
                const s=Math.round(v.sum/v.count);
                return(<div key={k} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{color:"#F0EDE8",fontSize:14}}>{COMP_LABELS[k]||k}</div>
                    <div className="cinzel" style={{color:scoreColor(s),fontWeight:700,fontSize:13}}>{s}/10</div>
                  </div>
                  <div style={{background:"#1A1A1A",borderRadius:4,height:6}}>
                    <div style={{background:scoreColor(s),width:`${s*10}%`,height:6,borderRadius:4,transition:"width 1s"}}/>
                  </div>
                </div>);
              })}
            </div>
          )}

          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:24,marginBottom:20}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:16}}>TRANSCRIÇÃO COMENTADA</div>
            {simScores.map((s,i)=>(
              <div key={i} style={{marginBottom:24,paddingBottom:24,borderBottom:i<simScores.length-1?"1px solid #1A1A1A":"none"}}>
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:scoreColor(s.score)+"22",border:`1px solid ${scoreColor(s.score)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span className="cinzel" style={{fontSize:10,color:scoreColor(s.score),fontWeight:700}}>{s.score}</span>
                  </div>
                  <div>
                    <div className="cinzel" style={{color:"#5A5248",fontSize:10,letterSpacing:2,marginBottom:3}}>TURNO {s.turn} · {COMP_LABELS[s.competency]}</div>
                    <div style={{color:"#F0EDE8",fontSize:14,fontStyle:"italic"}}>"{s.studentMessage}"</div>
                  </div>
                </div>
                <div style={{marginLeft:36,display:"flex",flexDirection:"column",gap:5}}>
                  {s.feedback&&<div style={{color:"#998E82",fontSize:13,lineHeight:1.5}}>{s.feedback}</div>}
                  {s.good&&<div style={{color:"#5BB85B",fontSize:13}}>✓ {s.good}</div>}
                  {s.improve&&<div style={{color:"#D4A853",fontSize:13}}>↗ {s.improve}</div>}
                  {s.exemplary&&<div style={{background:"#0A0F0A",borderLeft:"3px solid #5BB85B",padding:"7px 10px",borderRadius:"0 6px 6px 0",color:"#998E82",fontSize:13,fontStyle:"italic",marginTop:3}}>{s.exemplary}</div>}
                </div>
              </div>
            ))}
          </div>

          {avgScore>=7&&(
            <div style={{background:"linear-gradient(135deg,#0A0800,#0F0A00)",border:`2px solid ${course.color}`,borderRadius:16,padding:36,marginBottom:20,textAlign:"center"}}>
              <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:course.color,marginBottom:10}}>SIMULAÇÃO APROVADA</div>
              <div className="cinzel" style={{fontSize:18,color:"#F0EDE8",fontWeight:700,marginBottom:6}}>{S?.name}</div>
              <div style={{color:"#998E82",fontSize:14,marginBottom:12}}>demonstrou competência com<br/><span style={{color:course.color,fontStyle:"italic",fontSize:16}}>{simProfile.name} — {simProfile.procedure}</span></div>
              <div className="cinzel" style={{color:"#5A5248",fontSize:10,letterSpacing:2}}>BIZZ.IA SALES ACADEMY · IA · {new Date().toLocaleDateString("pt-BR")}</div>
            </div>
          )}

          <div style={{display:"flex",gap:12,justifyContent:"center",paddingBottom:44}}>
            <button onClick={()=>{setView("dashboard");setActiveTab("sim");}} style={{padding:"13px 28px",background:"transparent",border:`1px solid ${course.color}`,color:course.color,borderRadius:8,fontSize:12,letterSpacing:3}}>ESCOLHER PACIENTE</button>
            <button onClick={()=>startSim(simLevel,simProfile)} style={{padding:"13px 28px",background:`linear-gradient(135deg,${course.color},#D4A853)`,color:"#000",borderRadius:8,fontSize:12,letterSpacing:3,fontWeight:700}}>REFAZER</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MANAGER ────────────────────────────────────────────────────────
  if (view==="manager") {
    const students = appData.users.filter(u=>u.role==="student");
    const totalExams = students.reduce((a,u)=>a+Object.keys(appData.results[u.id]||{}).length,0);
    const totalPassed = students.reduce((a,u)=>a+Object.values(appData.results[u.id]||{}).filter(r=>r.passed).length,0);
    const totalSims = students.reduce((a,u)=>a+(appData.simResults[u.id]||[]).length,0);
    const avgSim = totalSims>0?Math.round(students.flatMap(u=>appData.simResults[u.id]||[]).reduce((a,s)=>a+s.avgScore,0)/totalSims):null;
    return (
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
            <div>
              <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:"#B87333",marginBottom:4}}>BIZZ.IA · SALES ACADEMY</div>
              <div className="cinzel" style={{fontSize:22,color:"#F0EDE8",fontWeight:700}}>PAINEL DO GESTOR</div>
              <div style={{color:"#998E82",fontSize:13}}>{S?.org}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setView("dashboard")} style={{background:"#0A0A0A",border:"1px solid #1F1A15",color:"#998E82",borderRadius:8,padding:"9px 16px",fontSize:11,letterSpacing:2}}>MINHA ÁREA</button>
              <button onClick={doLogout} style={{background:"#0A0A0A",border:"1px solid #1F1A15",color:"#998E82",borderRadius:8,padding:"9px 16px",fontSize:11,letterSpacing:2}}>SAIR</button>
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:28}}>
            {[["ALUNOS",students.length,""],["EXAMES",totalExams,""],["APROVAÇÕES",totalPassed,""],
              ["SIMULAÇÕES IA",totalSims,"pro"],["MÉDIA IA",avgSim!==null?`${avgSim}/10`:"–","pro"]].map(([k,v,tag])=>(
              <div key={k} style={{background:"#0A0A0A",border:`1px solid ${tag==="pro"?"#B8733333":"#1F1A15"}`,borderRadius:12,padding:20,textAlign:"center"}}>
                <div className="cinzel" style={{fontSize:28,fontWeight:900,color:tag==="pro"?"#B87333":"#F0EDE8"}}>{v}</div>
                <div className="cinzel" style={{color:"#5A5248",fontSize:9,letterSpacing:2,marginTop:6}}>{k}{tag==="pro"&&<span style={{color:"#B87333"}}> ✦</span>}</div>
              </div>
            ))}
          </div>

          {/* Team table */}
          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:24,marginBottom:20}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:18}}>EQUIPE — {students.length} COLABORADORES</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px 80px 80px",gap:10,padding:"0 12px 12px",borderBottom:"1px solid #1A1A1A"}}>
              {["COLABORADOR","NÍV.1","NÍV.2","NÍV.3","NÍV.4","PLANO","SIM. IA",""].map(h=>(
                <div key={h} className="cinzel" style={{color:"#5A5248",fontSize:9,letterSpacing:2}}>{h}</div>
              ))}
            </div>
            {students.map(u=>{
              const res=appData.results[u.id]||{};
              const sims=appData.simResults[u.id]||[];
              const simAvg=sims.length>0?Math.round(sims.reduce((a,s)=>a+s.avgScore,0)/sims.length):null;
              return(
                <div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px 80px 80px",gap:10,padding:"16px 12px",borderBottom:"1px solid #111",alignItems:"center"}}>
                  <div>
                    <div style={{color:"#F0EDE8",fontSize:14}}>{u.name}</div>
                    <div style={{color:"#5A5248",fontSize:11}}>{u.org}</div>
                  </div>
                  {[1,2,3,4].map(lvl=>{
                    const r=res[lvl];
                    return(<div key={lvl} style={{textAlign:"center"}}>
                      {r?<div><div className="cinzel" style={{fontSize:15,fontWeight:700,color:r.passed?"#5BB85B":"#C0392B"}}>{r.pct}%</div><div style={{fontSize:9,color:r.passed?"#5BB85B":"#C0392B"}}>{r.passed?"APR":"REP"}</div></div>:<div style={{color:"#5A5248",fontSize:12}}>—</div>}
                    </div>);
                  })}
                  <div style={{textAlign:"center"}}>
                    <div style={{background:u.plan==="pro"?"#B8733322":"#1A1A1A",border:`1px solid ${u.plan==="pro"?"#B8733344":"#1F1A15"}`,borderRadius:20,padding:"3px 8px",fontSize:9,color:u.plan==="pro"?"#B87333":"#5A5248",fontFamily:"Cinzel,serif",letterSpacing:1,display:"inline-block"}}>{u.plan.toUpperCase()}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    {simAvg!==null?<div className="cinzel" style={{fontSize:15,fontWeight:700,color:scoreColor(simAvg)}}>{simAvg}/10</div>:<div style={{color:"#5A5248",fontSize:12}}>—</div>}
                  </div>
                  <button onClick={()=>{setMgStudent(u);setView("manager-student");}} style={{background:"#111",border:"1px solid #1F1A15",color:"#B87333",borderRadius:6,padding:"7px 10px",fontSize:9,letterSpacing:2}}>VER</button>
                </div>
              );
            })}
          </div>

          {/* Progress por nível */}
          <div style={{background:"#0A0A0A",border:"1px solid #1F1A15",borderRadius:16,padding:24}}>
            <div className="cinzel" style={{fontSize:11,letterSpacing:4,color:"#B87333",marginBottom:18}}>APROVAÇÃO POR NÍVEL</div>
            {COURSES.map(c=>{
              const atts=students.map(u=>(appData.results[u.id]||{})[c.id]).filter(Boolean);
              const pct=students.length>0?Math.round(atts.filter(r=>r.passed).length/students.length*100):0;
              const avg=atts.length>0?Math.round(atts.reduce((a,r)=>a+r.pct,0)/atts.length):null;
              return(<div key={c.id} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                  <div><span className="cinzel" style={{color:c.color,fontSize:11}}>NÍV.{c.level}</span><span style={{color:"#998E82",fontSize:13,marginLeft:10}}>{c.title}</span></div>
                  <div style={{color:"#998E82",fontSize:12}}>{atts.filter(r=>r.passed).length}/{students.length}{avg!==null?` · Média: ${avg}%`:""}</div>
                </div>
                <div style={{background:"#1A1A1A",borderRadius:4,height:7}}>
                  <div style={{background:c.color,width:`${pct}%`,height:7,borderRadius:4,transition:"width 1s"}}/>
                </div>
              </div>);
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── MANAGER STUDENT ────────────────────────────────────────────────
  if (view==="manager-student" && mgStudent) {
    const res=appData.results[mgStudent.id]||{};
    const sims=appData.simResults[mgStudent.id]||[];
    return(
      <div style={{background:"#000",minHeight:"100vh",padding:24}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <button onClick={()=>setView("manager")} style={{background:"transparent",border:"none",color:"#B87333",fontSize:12,letterSpacing:2,marginBottom:24,cursor:"pointer"}}>← VOLTAR AO PAINEL</button>
          <div className="fade">
            <div className="cinzel" style={{fontSize:10,letterSpacing:6,color:"#B87333",marginBottom:6}}>PERFIL DO ALUNO</div>
            <div className="cinzel" style={{fontSize:22,color:"#F0EDE8",fontWeight:700,marginBottom:3}}>{mgStudent.name}</div>
            <div style={{color:"#998E82",fontSize:14,marginBottom:28}}>{mgStudent.org} · Plano <span style={{color:"#B87333",textTransform:"uppercase"}}>{mgStudent.plan}</span></div>

            {/* Exames */}
            <div className="cinzel" style={{fontSize:10,letterSpacing:4,color:"#5A5248",marginBottom:14}}>EXAMES</div>
            {COURSES.map(c=>{
              const r=res[c.id];
              if(!r) return(<div key={c.id} style={{background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:10,padding:18,marginBottom:12,display:"flex",justifyContent:"space-between"}}><span className="cinzel" style={{color:"#5A5248",fontSize:12}}>NÍV.{c.level} {c.title}</span><span style={{color:"#5A5248",fontSize:12}}>Não realizado</span></div>);
              const cm={};
              r.questions?.forEach((q,i)=>{const a=r.answers?.[i];if(!a)return;if(!cm[q.k])cm[q.k]={correct:0,total:0};cm[q.k].total++;if(a.chosen===a.correct)cm[q.k].correct++;});
              return(<div key={c.id} style={{background:"#0A0A0A",border:`1px solid ${r.passed?c.color+"44":"#2A0A0A"}`,borderRadius:14,padding:22,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div><span className="cinzel" style={{color:c.color,fontSize:11}}>NÍV.{c.level} · </span><span className="cinzel" style={{color:"#F0EDE8",fontSize:13}}>{c.title}</span></div>
                  <div style={{textAlign:"right"}}><div className="cinzel" style={{fontSize:26,fontWeight:900,color:r.passed?"#5BB85B":"#C0392B"}}>{r.pct}%</div><div style={{color:"#5A5248",fontSize:11}}>{r.score}/{r.total} · {r.date}</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {Object.entries(cm).map(([k,v])=>{const p=Math.round(v.correct/v.total*100);return(<div key={k} style={{background:"#111",borderRadius:8,padding:"9px 12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{color:"#998E82",fontSize:12}}>{COMP_LABELS[k]||k}</div><div className="cinzel" style={{color:p>=70?"#5BB85B":"#C0392B",fontSize:11}}>{p}%</div></div><div style={{background:"#1A1A1A",borderRadius:3,height:4}}><div style={{background:p>=70?"#5BB85B":p>=50?"#D4A853":"#C0392B",width:`${p}%`,height:4,borderRadius:3}}/></div></div>);})}
                </div>
              </div>);
            })}

            {/* Simulações */}
            {sims.length>0&&(<>
              <div className="cinzel" style={{fontSize:10,letterSpacing:4,color:"#5A5248",margin:"24px 0 14px"}}>SIMULAÇÕES IA ({sims.length})</div>
              {sims.map((s,i)=>(
                <div key={i} style={{background:"#0A0A0A",border:`1px solid ${scoreColor(s.avgScore)}33`,borderRadius:12,padding:18,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"#F0EDE8",fontSize:14}}>{s.profileName}</div>
                    <div style={{color:"#998E82",fontSize:12}}>{s.procedure}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="cinzel" style={{fontSize:22,fontWeight:900,color:scoreColor(s.avgScore)}}>{s.avgScore}/10</div>
                    <div style={{color:"#5A5248",fontSize:11}}>{s.date}</div>
                  </div>
                </div>
              ))}
            </>)}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
