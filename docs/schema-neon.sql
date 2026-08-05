-- ============================================================
-- BIZZ.IA SALES ACADEMY - SCHEMA COMPLETO
-- PostgreSQL (Neon) | Multi-tenancy por Organization
-- Versão 1.0 | Abril 2026
-- ============================================================

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== ENUMS ====================
CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'manager', 'student');
CREATE TYPE exam_status AS ENUM ('in_progress', 'completed', 'expired', 'abandoned');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'open_ended', 'simulation');
CREATE TYPE competency_type AS ENUM (
  'rapport', 'price_objection', 'initial_discovery', 'deep_discovery',
  'presentation', 'technical_objection', 'closing', 'follow_up',
  'upsell', 'referral', 'reactivation', 'ltv_management',
  'peer_positioning', 'negotiation', 'discretion'
);
CREATE TYPE difficulty_level AS ENUM ('foundation', 'high_ticket', 'premium', 'ltv');
CREATE TYPE certificate_status AS ENUM ('active', 'expired', 'revoked');

-- ==================== ORGANIZATIONS (TENANTS) ====================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'starter', -- starter, professional, enterprise, white_label
  max_users INTEGER DEFAULT 5,
  subscription_status VARCHAR(20) DEFAULT 'trial',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== USERS ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'student',
  avatar_url TEXT,
  phone VARCHAR(20),
  job_title VARCHAR(100), -- ex: "Recepcionista", "Consultora de Vendas"
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ==================== COURSES (NÍVEIS) ====================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER NOT NULL UNIQUE, -- 1, 2, 3, 4
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  difficulty difficulty_level NOT NULL,
  price_range VARCHAR(50), -- "R$ 3-8k", "R$ 10-25k", etc.
  time_limit_minutes INTEGER DEFAULT 25,
  passing_score INTEGER DEFAULT 75, -- percentual
  questions_per_exam INTEGER DEFAULT 30,
  unlock_requires_level INTEGER, -- NULL para Nível 1
  badge_icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== QUESTION BANK ====================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  competency competency_type NOT NULL,
  question_type question_type DEFAULT 'multiple_choice',
  scenario_context TEXT, -- contexto do cenário (perfil do paciente, situação)
  question_text TEXT NOT NULL,
  options JSONB, -- array de opções para múltipla escolha
  correct_option_index INTEGER, -- índice da resposta correta (0-based)
  feedback_correct TEXT, -- feedback quando acerta
  feedback_incorrect TEXT, -- feedback quando erra
  ai_evaluation_rubric TEXT, -- rubrica para avaliação por IA (open_ended)
  difficulty_weight DECIMAL(3,2) DEFAULT 1.0, -- peso na nota final
  procedure_type VARCHAR(100), -- rinoplastia, mamoplastia, etc.
  patient_profile VARCHAR(100), -- ansiosa, decidida, pesquisadora, etc.
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  correct_rate DECIMAL(5,2), -- taxa de acerto histórica
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_competency ON questions(competency);
CREATE INDEX idx_questions_type ON questions(question_type);

-- ==================== EXAM SESSIONS ====================
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status exam_status DEFAULT 'in_progress',
  question_ids UUID[] NOT NULL, -- IDs das questões selecionadas (randomizadas)
  option_shuffles JSONB, -- mapeamento de shuffle por questão
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  total_score DECIMAL(5,2),
  passed BOOLEAN,
  competency_scores JSONB, -- {"rapport": 85, "closing": 70, ...}
  attempt_number INTEGER DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_org ON exam_sessions(org_id);
CREATE INDEX idx_exam_sessions_course ON exam_sessions(course_id);

-- ==================== EXAM ANSWERS ====================
CREATE TABLE exam_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  selected_option_index INTEGER, -- para múltipla escolha
  open_response TEXT, -- para respostas abertas
  ai_score DECIMAL(5,2), -- nota dada pela IA (0-10)
  ai_feedback TEXT, -- feedback gerado pela IA
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exam_answers_session ON exam_answers(session_id);

-- ==================== CERTIFICATES ====================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  session_id UUID NOT NULL REFERENCES exam_sessions(id),
  certificate_number VARCHAR(50) UNIQUE NOT NULL, -- ex: "BIZZIA-SA-2026-00001"
  qr_validation_code VARCHAR(100) UNIQUE NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  status certificate_status DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = sem validade
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_org ON certificates(org_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- ==================== ANALYTICS EVENTS ====================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL, -- 'exam_started', 'exam_completed', 'question_answered', etc.
  event_data JSONB DEFAULT '{}',
  session_id UUID REFERENCES exam_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_org ON analytics_events(org_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- ==================== AI EVALUATION LOG ====================
CREATE TABLE ai_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES exam_answers(id),
  model_used VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== VIEWS PARA DASHBOARD ====================

-- Performance por aluno
CREATE VIEW v_student_performance AS
SELECT
  u.id AS user_id,
  u.name AS user_name,
  u.org_id,
  c.level,
  c.title AS course_title,
  COUNT(es.id) AS total_attempts,
  MAX(es.total_score) AS best_score,
  AVG(es.total_score) AS avg_score,
  BOOL_OR(es.passed) AS has_passed,
  MAX(es.finished_at) AS last_attempt_at
FROM users u
JOIN exam_sessions es ON es.user_id = u.id
JOIN courses c ON c.id = es.course_id
WHERE es.status = 'completed'
GROUP BY u.id, u.name, u.org_id, c.level, c.title;

-- Performance por organização
CREATE VIEW v_org_performance AS
SELECT
  o.id AS org_id,
  o.name AS org_name,
  c.level,
  c.title AS course_title,
  COUNT(DISTINCT es.user_id) AS students_attempted,
  COUNT(DISTINCT CASE WHEN es.passed THEN es.user_id END) AS students_passed,
  AVG(es.total_score) AS avg_score,
  COUNT(es.id) AS total_attempts
FROM organizations o
JOIN exam_sessions es ON es.org_id = o.id
JOIN courses c ON c.id = es.course_id
WHERE es.status = 'completed'
GROUP BY o.id, o.name, c.level, c.title;

-- Competências fracas por organização (gaps de treinamento)
CREATE VIEW v_org_competency_gaps AS
SELECT
  es.org_id,
  q.competency,
  c.level,
  COUNT(*) AS total_answers,
  SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) AS correct_answers,
  ROUND(
    (SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 2
  ) AS accuracy_rate
FROM exam_answers ea
JOIN questions q ON q.id = ea.question_id
JOIN exam_sessions es ON es.id = ea.session_id
JOIN courses c ON c.id = es.course_id
WHERE es.status = 'completed'
GROUP BY es.org_id, q.competency, c.level
ORDER BY accuracy_rate ASC;

-- ==================== SEED: CURSOS ====================
INSERT INTO courses (level, title, subtitle, difficulty, price_range, time_limit_minutes, passing_score, questions_per_exam, unlock_requires_level) VALUES
(1, 'Fundamentos de Vendas Consultivas', 'Base sólida para atendimento em clínicas estéticas', 'foundation', 'R$ 3-8k', 25, 75, 30, NULL),
(2, 'Vendas High Ticket', 'Técnicas avançadas para procedimentos de alto valor', 'high_ticket', 'R$ 10-25k', 30, 80, 30, 1),
(3, 'Mindset Premium', 'Postura e negociação com clientela de altíssimo padrão', 'premium', 'R$ 25-80k+', 35, 85, 30, 2),
(4, 'Follow-up e LTV Management', 'Gestão de carteira e relacionamento vitalício', 'ltv', 'R$ 100-500k+ LTV', 35, 90, 30, 3);

-- ==================== FUNCTIONS ====================

-- Gerar número de certificado
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  seq INTEGER;
  cert_number VARCHAR(50);
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 'BIZZIA-SA-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO seq FROM certificates;
  cert_number := 'BIZZIA-SA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- Selecionar questões randomizadas para exame
CREATE OR REPLACE FUNCTION select_exam_questions(
  p_course_id UUID,
  p_count INTEGER DEFAULT 30
)
RETURNS UUID[] AS $$
DECLARE
  question_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id ORDER BY RANDOM())
  INTO question_ids
  FROM (
    SELECT id FROM questions
    WHERE course_id = p_course_id AND is_active = true
    ORDER BY RANDOM()
    LIMIT p_count
  ) sub;
  RETURN question_ids;
END;
$$ LANGUAGE plpgsql;

-- ==================== RLS (Row Level Security) ====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem dados da própria organização
CREATE POLICY org_isolation_users ON users
  FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_isolation_sessions ON exam_sessions
  FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_isolation_certificates ON certificates
  FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_isolation_analytics ON analytics_events
  FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);
