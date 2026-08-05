import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { Pendente, Secao } from '../LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidade — BIZZ.IA Sales Academy',
  robots: { index: false, follow: false },
};

/* =============================================================
   POLITICA DE PRIVACIDADE — ESTRUTURA, NAO CONTEUDO FINAL.

   Dossie Mestre §4.5 e Anexo A.6. O conteudo juridico definitivo
   vira do parecer da Dra. Emmanuelle Moura da Silva (OAB/SP
   528.742). Os blocos marcados como <Pendente> sao exatamente os
   pontos que dependem desse parecer — nao preencher por conta.

   O que ja e afirmacao factual sobre o sistema (subprocessadores,
   que dados o sistema coleta, quem ve o que) esta escrito. O que
   e decisao juridica esta marcado como pendente.
   ============================================================= */

export default function Privacidade() {
  return (
    <LegalPage
      rotulo="LGPD"
      titulo="Política de Privacidade"
      atualizacao="Versão estruturada — 05 de agosto de 2026"
    >
      <Secao titulo="1. Quem trata os seus dados">
        <p>
          A plataforma BIZZ.IA Sales Academy é operada pela BIZZ.IA Intelligence
          Ecosystem, que atua como operadora dos dados de treinamento em nome da
          clínica contratante. A clínica que contrata a licença é a controladora
          dos dados das suas colaboradoras.
        </p>
        <Pendente>
          Razão social completa, CNPJ, endereço e identificação do Encarregado
          pelo Tratamento de Dados (DPO), com canal de contato.
        </Pendente>
      </Secao>

      <Secao titulo="2. Quais dados são tratados">
        <p>A plataforma trata, sobre cada pessoa usuária:</p>
        <ul>
          <li>Nome, e-mail corporativo e clínica à qual está vinculada.</li>
          <li>Plano contratado e papel na plataforma (aluna ou gestora).</li>
          <li>
            Resultados de exames: pontuação, alternativas escolhidas, tempo de
            realização e desempenho por competência.
          </li>
          <li>
            Transcrições das simulações: o que a pessoa escreveu durante o
            treinamento, a avaliação de cada turno e a pontuação final.
          </li>
        </ul>
        <p>
          <strong>Nenhum dado de paciente real é tratado pela plataforma.</strong>{' '}
          Todas as personas das simulações são fictícias e existem apenas para
          fins de treinamento. Dados de pacientes reais não devem ser inseridos
          em nenhum campo do sistema.
        </p>
      </Secao>

      <Secao titulo="3. Para que os dados são usados">
        <p>
          Para executar o contrato de capacitação firmado com a clínica: permitir
          que a pessoa realize exames e simulações, emitir certificações e
          possibilitar que a gestão da clínica acompanhe a evolução da equipe.
        </p>
        <Pendente>
          Confirmação da base legal aplicável a cada finalidade (execução de
          contrato, legítimo interesse ou consentimento) e redação definitiva das
          finalidades.
        </Pendente>
      </Secao>

      <Secao titulo="4. Quem tem acesso">
        <p>
          As transcrições de simulação são dados de desempenho profissional. O
          acesso é restrito à própria pessoa avaliada e à gestão da clínica à qual
          ela está vinculada. Não há acesso cruzado entre clínicas diferentes.
        </p>
      </Secao>

      <Secao titulo="5. Subprocessadores">
        <p>
          A operação da plataforma depende dos seguintes fornecedores, que podem
          tratar dados em nome da BIZZ.IA:
        </p>
        <ul>
          <li>
            <strong>Anthropic</strong> — provedora do modelo de inteligência
            artificial usado no módulo de simulação. Recebe o texto escrito pela
            pessoa durante o treinamento e a descrição da persona fictícia.
          </li>
          <li>
            <strong>Neon</strong> — banco de dados PostgreSQL onde ficam
            armazenados usuários, resultados e transcrições.
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem da aplicação e registro de logs
            de acesso.
          </li>
        </ul>
        <Pendente>
          Localização de armazenamento de cada subprocessador, verificação da
          existência de transferência internacional de dados e cláusulas
          contratuais correspondentes.
        </Pendente>
      </Secao>

      <Secao titulo="6. Por quanto tempo os dados são guardados">
        <p>
          Recomendação técnica registrada no dossiê do projeto: retenção de
          transcrições de simulação por 12 meses, com possibilidade de exclusão
          antecipada solicitada pela clínica contratante.
        </p>
        <Pendente>
          Definição jurídica do prazo de retenção por categoria de dado e do
          procedimento de eliminação ao término do contrato.
        </Pendente>
      </Secao>

      <Secao titulo="7. Direitos da pessoa titular">
        <p>
          A LGPD assegura os direitos de confirmação, acesso, correção,
          anonimização, portabilidade, informação sobre compartilhamento e
          revogação de consentimento.
        </p>
        <Pendente>
          Canal formal de exercício de direitos, prazo de resposta e fluxo interno
          de atendimento aos pedidos.
        </Pendente>
      </Secao>

      <Secao titulo="8. Segurança">
        <p>
          As credenciais de acesso à inteligência artificial existem apenas no
          servidor e nunca são expostas ao navegador. O acesso à plataforma é
          autenticado e as chamadas ao modelo passam por limite de uso por pessoa.
        </p>
        <Pendente>
          Descrição das medidas técnicas e administrativas exigidas pelo art. 46 da
          LGPD e do plano de resposta a incidente de segurança.
        </Pendente>
      </Secao>

      <p style={{ marginTop: 40 }}>
        <Link href="/termos">Termos de Uso</Link>
        {' · '}
        <Link href="/">Início</Link>
      </p>
    </LegalPage>
  );
}
