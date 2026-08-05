import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { Pendente, Secao } from '../LegalPage';

export const metadata: Metadata = {
  title: 'Termos de Uso — BIZZ.IA Sales Academy',
  robots: { index: false, follow: false },
};

/* =============================================================
   TERMOS DE USO — ESTRUTURA, NAO CONTEUDO FINAL.

   Dossie Mestre §4.5 e Anexo A. Os blocos <Pendente> dependem do
   parecer da Dra. Emmanuelle Moura da Silva (OAB/SP 528.742),
   especialmente quanto a cadeia de responsabilidade (Anexo A.4) e
   ao limite de conteudo tecnico-medico (Anexo A.5).
   ============================================================= */

export default function Termos() {
  return (
    <LegalPage
      rotulo="TERMOS"
      titulo="Termos de Uso"
      atualizacao="Versão estruturada — 05 de agosto de 2026"
    >
      <Secao titulo="1. O que é esta plataforma">
        <p>
          O BIZZ.IA Sales Academy é uma plataforma de capacitação profissional
          destinada a equipes de recepção e atendimento de clínicas de estética e
          cirurgia plástica. A contratação é feita pela clínica, em modelo de
          licença por organização.
        </p>
        <p>
          A plataforma <strong>não se dirige a pacientes nem ao público geral</strong> e
          não oferece orientação clínica a nenhuma pessoa.
        </p>
      </Secao>

      <Secao titulo="2. Natureza do conteúdo">
        <p>
          Todos os cenários, questões, valores e personas apresentados são{' '}
          <strong>fictícios e ilustrativos</strong>, construídos para fins de
          treinamento. Em especial:
        </p>
        <ul>
          <li>
            Nenhum profissional citado nos cenários corresponde a pessoa real.
            Não há número de registro profissional, credencial ou histórico
            verificável associado a qualquer persona.
          </li>
          <li>
            Os valores de procedimento exibidos são ilustrativos e não constituem
            tabela de preços, referência de mercado ou sugestão de precificação.
            A clínica contratante configura a própria tabela.
          </li>
          <li>
            A plataforma não afirma percentual de melhoria de conversão, ticket,
            retenção ou qualquer outro resultado comercial.
          </li>
        </ul>
      </Secao>

      <Secao titulo="3. Limite de atuação de quem é capacitado">
        <p>
          O treinamento aborda acolhimento, descoberta de necessidade,
          apresentação de valor, manejo de objeção e ética no atendimento.{' '}
          <strong>
            Informação clínica, indicação de procedimento, avaliação de risco e
            prognóstico são atribuição exclusiva do profissional médico.
          </strong>{' '}
          A plataforma não habilita pessoa não médica a prestar orientação de
          natureza clínica.
        </p>
        <Pendente>
          Redação definitiva do limite entre atendimento consultivo e captação de
          pacientes, conforme a Resolução CFM 2.336/2023 e o Código de Ética
          Médica — ver Anexo A.2 e A.3 do dossiê.
        </Pendente>
      </Secao>

      <Secao titulo="4. Uso da inteligência artificial">
        <p>
          O módulo de simulação usa um modelo de linguagem para interpretar
          pacientes fictícias e avaliar as respostas de quem treina. A avaliação
          é uma ferramenta pedagógica e{' '}
          <strong>não constitui certificação de aptidão profissional</strong>{' '}
          perante terceiros.
        </p>
        <p>
          É vedado inserir dados de pacientes reais, informações de saúde de
          terceiros ou qualquer dado pessoal sensível nos campos de simulação.
        </p>
      </Secao>

      <Secao titulo="5. Contas e credenciais">
        <p>
          O acesso é nominal. Credenciais não devem ser compartilhadas. A clínica
          contratante é responsável por manter atualizada a lista de pessoas com
          acesso e por solicitar a revogação quando alguém deixa a equipe.
        </p>
      </Secao>

      <Secao titulo="6. Responsabilidade">
        <Pendente>
          Delimitação da cadeia de responsabilidade entre a BIZZ.IA, a clínica
          contratante e o médico responsável técnico quanto à conduta da
          profissional capacitada — ver Anexo A.4 do dossiê. Cláusulas de
          limitação de responsabilidade e de indenização.
        </Pendente>
      </Secao>

      <Secao titulo="7. Vigência, rescisão e foro">
        <Pendente>
          Prazo de vigência, condições de renovação e rescisão, tratamento dos
          dados após o término do contrato e foro de eleição.
        </Pendente>
      </Secao>

      <Secao titulo="8. Aceite">
        <p>
          O aceite destes termos e da Política de Privacidade é obrigatório no
          primeiro acesso à plataforma e é registrado com data e hora.
        </p>
      </Secao>

      <p style={{ marginTop: 40 }}>
        <Link href="/privacidade">Política de Privacidade</Link>
        {' · '}
        <Link href="/">Início</Link>
      </p>
    </LegalPage>
  );
}
