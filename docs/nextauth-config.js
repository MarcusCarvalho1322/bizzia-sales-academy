// ============================================================
// BIZZ.IA SALES ACADEMY — NextAuth.js Configuration
// Stack: Next.js 14 App Router + Neon + Prisma
//
// >>> DOCUMENTO DE REFERENCIA. NAO E CODIGO EM PRODUCAO. <<<
//
// Este arquivo e material de projeto da v3, mantido como
// referencia para quando o banco Neon for provisionado.
// A configuracao que a aplicacao realmente usa esta em
// lib/auth.ts e app/api/auth/[...nextauth]/route.ts.
//
// Todos os valores de credencial abaixo sao PLACEHOLDERS
// ("sk-ant-...", "sk_live_...", "user:password"). Nenhum e
// uma chave real. As chaves reais existem apenas como
// variaveis de ambiente no Vercel — ver .env.example.
// ============================================================

// === FILE: prisma/schema.prisma ===
/*
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  SUPER_ADMIN
  ORG_ADMIN
  MANAGER
  STUDENT
}

model Organization {
  id                   String   @id @default(uuid())
  name                 String
  slug                 String   @unique
  logoUrl              String?
  plan                 String   @default("starter")
  maxUsers             Int      @default(5)
  subscriptionStatus   String   @default("trial")
  stripeCustomerId     String?
  stripeSubscriptionId String?
  settings             Json     @default("{}")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  users                User[]
  examSessions         ExamSession[]
  certificates         Certificate[]
}

model User {
  id            String       @id @default(uuid())
  orgId         String
  email         String
  passwordHash  String
  name          String
  role          UserRole     @default(STUDENT)
  avatarUrl     String?
  phone         String?
  jobTitle      String?
  isActive      Boolean      @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  organization  Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  examSessions  ExamSession[]
  certificates  Certificate[]

  @@unique([orgId, email])
  @@index([orgId])
  @@index([email])
}

model ExamSession {
  id              String       @id @default(uuid())
  userId          String
  courseLevel      Int
  orgId           String
  status          String       @default("in_progress")
  questionIds     Json
  startedAt       DateTime     @default(now())
  finishedAt      DateTime?
  timeSpentSeconds Int?
  totalScore      Float?
  passed          Boolean?
  competencyScores Json?
  attemptNumber   Int          @default(1)
  createdAt       DateTime     @default(now())
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  answers         ExamAnswer[]
  certificate     Certificate?

  @@index([userId])
  @@index([orgId])
}

model ExamAnswer {
  id                  String      @id @default(uuid())
  sessionId           String
  questionIndex       Int
  selectedOptionIndex Int?
  openResponse        String?
  aiScore             Float?
  aiFeedback          String?
  isCorrect           Boolean?
  answeredAt          DateTime    @default(now())
  session             ExamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
}

model Certificate {
  id                String       @id @default(uuid())
  userId            String
  courseLevel        Int
  orgId             String
  sessionId         String       @unique
  certificateNumber String       @unique
  qrCode            String       @unique
  score             Float
  status            String       @default("active")
  issuedAt          DateTime     @default(now())
  expiresAt         DateTime?
  pdfUrl            String?
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization      Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  session           ExamSession  @relation(fields: [sessionId], references: [id])

  @@index([userId])
  @@index([orgId])
}
*/

// === FILE: app/api/auth/[...nextauth]/route.ts ===
/*
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "BIZZ.IA Sales Academy",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email, isActive: true },
          include: { organization: true },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          orgName: user.organization.name,
          orgSlug: user.organization.slug,
          jobTitle: user.jobTitle,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 dias
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.orgId = user.orgId;
        token.orgName = user.orgName;
        token.orgSlug = user.orgSlug;
        token.jobTitle = user.jobTitle;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.orgId = token.orgId;
        session.user.orgName = token.orgName;
        session.user.orgSlug = token.orgSlug;
        session.user.jobTitle = token.jobTitle;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
*/

// === FILE: middleware.ts ===
/*
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas de admin: apenas ORG_ADMIN e SUPER_ADMIN
    if (path.startsWith("/admin") || path.startsWith("/dashboard/manager")) {
      if (token?.role !== "ORG_ADMIN" && token?.role !== "SUPER_ADMIN" && token?.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Rotas de super admin
    if (path.startsWith("/super-admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/super-admin/:path*", "/exam/:path*"],
};
*/

// === FILE: .env.local (template) ===
/*
# Neon Database
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/sales_academy?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/sales_academy?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://sales-academy.bizz.ia"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Claude API (usado via n8n, mas disponível para chamadas diretas)
ANTHROPIC_API_KEY="sk-ant-..."

# n8n Webhook URLs
N8N_EVALUATE_URL="https://your-n8n.railway.app/webhook/sales-academy/evaluate"
N8N_GENERATE_URL="https://your-n8n.railway.app/webhook/sales-academy/generate-scenario"

# Stripe (pagamentos)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_INDIVIDUAL="price_..."
STRIPE_PRICE_CLINIC_5="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."

# Vercel
VERCEL_URL="https://sales-academy.bizz.ia"
*/

// === FILE: app/api/exam/evaluate/route.ts ===
/*
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question_id, student_response, question_text, scenario_context, competency, level } = await req.json();

  // Chamar n8n webhook para avaliação por Claude API
  const n8nUrl = process.env.N8N_EVALUATE_URL;
  
  try {
    const response = await fetch(n8nUrl!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id,
        student_response,
        question_text,
        scenario_context,
        competency,
        level,
        user_id: session.user.id,
        org_id: session.user.orgId,
      }),
    });

    const evaluation = await response.json();
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json({ error: "Falha na avaliação" }, { status: 500 });
  }
}
*/

// === FILE: package.json (dependências necessárias) ===
const DEPENDENCIES = {
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "next-auth": "^4.24.0",
  "@auth/prisma-adapter": "^2.0.0",
  "@prisma/client": "^5.15.0",
  "prisma": "^5.15.0",
  "bcryptjs": "^2.4.3",
  "@neondatabase/serverless": "^0.9.0",
  "stripe": "^15.0.0",
  "recharts": "^2.12.0",
  "lucide-react": "^0.383.0",
  "tailwindcss": "^3.4.0",
  "qrcode": "^1.5.3",
};

const DEV_DEPENDENCIES = {
  "typescript": "^5.5.0",
  "@types/react": "^18.3.0",
  "@types/node": "^20.14.0",
  "@types/bcryptjs": "^2.4.6",
};

console.log("=== BIZZ.IA Sales Academy - Auth Configuration ===");
console.log("Dependências necessárias:", JSON.stringify(DEPENDENCIES, null, 2));
console.log("Dev Dependencies:", JSON.stringify(DEV_DEPENDENCIES, null, 2));
console.log("\n=== Comandos de Setup ===");
console.log("npx create-next-app@14 sales-academy --typescript --tailwind --app --src-dir");
console.log("npm install next-auth @auth/prisma-adapter @prisma/client bcryptjs @neondatabase/serverless stripe recharts lucide-react qrcode");
console.log("npx prisma init");
console.log("npx prisma db push");
console.log("npx prisma generate");
