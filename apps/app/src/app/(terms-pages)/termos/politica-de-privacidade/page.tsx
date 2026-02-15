import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Cuidly',
  description:
    'Política de privacidade da Cuidly. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualizado em 26/01/2026
        </p>
      </div>

      {/* Índice */}
      <nav className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Índice</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
          <li>
            <a href="#controlador" className="hover:text-fuchsia-600">
              Identificação do Controlador
            </a>
          </li>
          <li>
            <a href="#definicoes" className="hover:text-fuchsia-600">
              Definições
            </a>
          </li>
          <li>
            <a href="#dados-coletados" className="hover:text-fuchsia-600">
              Dados Coletados
            </a>
          </li>
          <li>
            <a href="#finalidades" className="hover:text-fuchsia-600">
              Finalidades do Tratamento
            </a>
          </li>
          <li>
            <a href="#compartilhamento" className="hover:text-fuchsia-600">
              Compartilhamento com Terceiros
            </a>
          </li>
          <li>
            <a href="#seguranca" className="hover:text-fuchsia-600">
              Segurança dos Dados
            </a>
          </li>
          <li>
            <a href="#retencao" className="hover:text-fuchsia-600">
              Retenção de Dados
            </a>
          </li>
          <li>
            <a href="#direitos" className="hover:text-fuchsia-600">
              Direitos dos Titulares
            </a>
          </li>
          <li>
            <a href="#crianças" className="hover:text-fuchsia-600">
              Dados de Crianças
            </a>
          </li>
          <li>
            <a href="#atualizacoes" className="hover:text-fuchsia-600">
              Atualizações desta Política
            </a>
          </li>
          <li>
            <a href="#contato" className="hover:text-fuchsia-600">
              Contato
            </a>
          </li>
        </ol>
      </nav>

      <div className="space-y-6 text-gray-700">
        <p>
          A Cuidly (
          <Link
            href="/"
            className="text-fuchsia-600 underline transition-colors hover:text-fuchsia-700"
          >
            cuidly.com
          </Link>
          ) está comprometida com a proteção da sua privacidade e dos seus dados
          pessoais. Esta Política de Privacidade descreve como coletamos,
          usamos, armazenamos e protegemos as informações das pessoas que
          utilizam nossa plataforma, em conformidade com a Lei Geral de Proteção
          de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
        </p>

        {/* 1. Identificação do Controlador */}
        <section id="controlador">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            1. Identificação do Controlador
          </h2>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium">Cuidly Tecnologia Ltda</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <strong>CNPJ:</strong> 63.813.138/0001-20
              </li>
              <li>
                <strong>Endereço:</strong> Alameda Rio Negro, 503 - Sala 2020 -
                Alphaville Industrial, Barueri/SP - CEP 06454-000
              </li>
              <li>
                <strong>Suporte:</strong>{' '}
                <a
                  href="https://cuidly.com/app/suporte"
                  className="text-fuchsia-600 hover:text-fuchsia-700"
                >
                  cuidly.com/app/suporte
                </a>
              </li>
              <li>
                <strong>Encarregado (DPO):</strong> Lucas Furlan
              </li>
              <li>
                <strong>E-mail do DPO:</strong>{' '}
                <a
                  href="mailto:dpo@cuidly.com"
                  className="text-fuchsia-600 hover:text-fuchsia-700"
                >
                  dpo@cuidly.com
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* 2. Definições */}
        <section id="definicoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            2. Definições
          </h2>
          <p className="mt-4">
            Para melhor compreensão desta Política, apresentamos as seguintes
            definições conforme a LGPD:
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              <strong>Dados pessoais:</strong> informação relacionada a pessoa
              natural identificada ou identificável (ex.: nome, CPF, e-mail).
            </li>
            <li>
              <strong>Dados pessoais sensíveis:</strong> dados sobre origem
              racial ou étnica, convicção religiosa, opinião política, dados
              referentes à saúde ou à vida sexual, dados genéticos ou
              biométricos.
            </li>
            <li>
              <strong>Tratamento:</strong> toda operação realizada com dados
              pessoais (coleta, armazenamento, uso, compartilhamento, exclusão,
              etc.).
            </li>
            <li>
              <strong>Titular:</strong> pessoa natural a quem se referem os
              dados pessoais.
            </li>
            <li>
              <strong>Controlador:</strong> pessoa natural ou jurídica que toma
              as decisões sobre o tratamento de dados pessoais (no caso, a
              Cuidly).
            </li>
            <li>
              <strong>Operador:</strong> pessoa natural ou jurídica que realiza
              o tratamento de dados pessoais em nome do controlador.
            </li>
            <li>
              <strong>Consentimento:</strong> manifestação livre, informada e
              inequívoca pela qual o titular concorda com o tratamento de seus
              dados pessoais.
            </li>
            <li>
              <strong>Anonimização:</strong> utilização de meios técnicos para
              que um dado perca a possibilidade de associação, direta ou
              indireta, a um indivíduo.
            </li>
          </ul>
        </section>

        {/* 3. Dados Coletados */}
        <section id="dados-coletados">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            3. Dados Coletados
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.1 Dados de Profissionais (Babás)
          </h3>
          <p className="mt-2">
            Para prestar nossos serviços aos profissionais, coletamos os
            seguintes dados:
          </p>

          <h4 className="mt-4 font-semibold text-gray-800">
            Dados de identificação:
          </h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Nome completo</li>
            <li>CPF (armazenado de forma criptografada)</li>
            <li>Data de nascimento</li>
            <li>Gênero</li>
            <li>Número de telefone</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Dados de endereço:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>CEP, rua, número, complemento</li>
            <li>Bairro, cidade, estado</li>
            <li>Coordenadas geográficas (para cálculo de distância)</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Documentos:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>RG ou CNH (frente e verso)</li>
            <li>Selfie para verificação facial</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">
            Dados profissionais:
          </h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Anos de experiência</li>
            <li>Faixas etárias de experiência</li>
            <li>Certificações e cursos</li>
            <li>Idiomas</li>
            <li>Pontos fortes e especializações</li>
            <li>Atividades que aceita realizar</li>
            <li>Disponibilidade semanal</li>
            <li>Tipos de contratação aceitos (CLT, MEI, autônoma)</li>
            <li>Tarifas (por hora, dia ou mês)</li>
            <li>Raio de deslocamento</li>
            <li>Referências profissionais (nome, telefone, relacionamento)</li>
            <li>Texto de apresentação (biografia)</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">
            Dados de verificação (sensíveis):
          </h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Resultado de validação facial (biometria)</li>
            <li>Resultado de prova de vida (liveness)</li>
            <li>
              Resultado de verificação de antecedentes criminais (Polícia
              Federal e Civil)
            </li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Dados financeiros:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Chave PIX (tipo e valor)</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.2 Dados de Contratantes (Pais)
          </h3>
          <p className="mt-2">
            Para prestar nossos serviços aos contratantes, coletamos os
            seguintes dados:
          </p>

          <h4 className="mt-4 font-semibold text-gray-800">
            Dados de identificação:
          </h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Nome completo do responsável</li>
            <li>CPF (armazenado de forma criptografada)</li>
            <li>Número de telefone</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Dados de endereço:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>CEP, rua, número, complemento</li>
            <li>Bairro, cidade, estado</li>
            <li>Coordenadas geográficas</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Dados da família:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Tipo de moradia</li>
            <li>Presença de animais de estimação</li>
            <li>Nível de presença dos pais durante o trabalho</li>
            <li>Regras da casa</li>
            <li>Valores importantes na babá</li>
            <li>Preferências de babá (gênero, idade, tipo)</li>
            <li>Texto de apresentação da família</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">
            Dados das crianças:
          </h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Nome</li>
            <li>Data de nascimento (ou previsão, para gestantes)</li>
            <li>Gênero</li>
            <li>Alergias</li>
            <li>Necessidades especiais (se houver)</li>
            <li>Rotina diária</li>
            <li>Prioridades de cuidado</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">Dados de vagas:</h4>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Título e descrição da vaga</li>
            <li>Tipo de contratação</li>
            <li>Horários e dias</li>
            <li>Benefícios oferecidos</li>
            <li>Faixa salarial</li>
            <li>Requisitos obrigatórios</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.3 Dados Coletados Automaticamente
          </h3>
          <p className="mt-2">
            Ao navegar em nossa plataforma, coletamos automaticamente:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Endereço IP</li>
            <li>
              Localização aproximada (cidade, estado, país) derivada do IP
            </li>
            <li>Tipo de dispositivo (desktop, tablet, celular)</li>
            <li>Navegador utilizado</li>
            <li>Páginas visitadas e tempo de permanência</li>
            <li>Origem do acesso (referrer)</li>
            <li>Identificador de sessão</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.4 Dados de Comunicação
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Mensagens trocadas entre usuários pelo chat</li>
            <li>Candidaturas a vagas e mensagens de apresentação</li>
            <li>Avaliações e comentários</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.5 Dados de Pagamento
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Histórico de assinaturas e pagamentos</li>
            <li>Método de pagamento utilizado</li>
            <li>Status das transações</li>
          </ul>
          <p className="mt-2 text-sm italic">
            Nota: Dados completos de cartão de crédito são processados
            diretamente pelos gateways de pagamento e não são armazenados pela
            Cuidly.
          </p>
        </section>

        {/* 4. Finalidades */}
        <section id="finalidades">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            4. Finalidades do Tratamento
          </h2>
          <p className="mt-4">
            Os dados pessoais são tratados com base nas seguintes hipóteses
            legais previstas na LGPD:
          </p>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            4.1 Execução de Contrato
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Criação e gestão de contas de usuário</li>
            <li>Conexão entre contratantes e profissionais</li>
            <li>Processamento de pagamentos de assinatura</li>
            <li>
              Envio de comunicações transacionais (confirmação de cadastro,
              pagamento, etc.)
            </li>
            <li>Gerenciamento de vagas e candidaturas</li>
            <li>Viabilização do chat entre usuários</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            4.2 Cumprimento de Obrigação Legal
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Verificação de antecedentes criminais (exigência para trabalho com
              menores)
            </li>
            <li>Validação de identidade via documentos oficiais</li>
            <li>Retenção de dados fiscais e contábeis pelo prazo legal</li>
            <li>Atendimento a requisições de autoridades competentes</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            4.3 Interesse Legítimo do Controlador
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Segurança da plataforma e prevenção de fraudes</li>
            <li>Melhoria da experiência do usuário</li>
            <li>Análise de métricas de uso (analytics)</li>
            <li>Matching inteligente entre contratantes e profissionais</li>
            <li>Moderação de conteúdo e avaliações</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            4.4 Consentimento
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Envio de comunicações de marketing e promoções</li>
            <li>Uso de cookies de analytics e publicidade</li>
            <li>Geração de conteúdo por inteligência artificial (biografias)</li>
            <li>Realização de verificação facial (biometria)</li>
            <li>Consulta de antecedentes criminais</li>
          </ul>
        </section>

        {/* 5. Compartilhamento */}
        <section id="compartilhamento">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            5. Compartilhamento com Terceiros
          </h2>
          <p className="mt-4">
            Para prestar nossos serviços, compartilhamos dados com parceiros de
            tecnologia que atuam como operadores, incluindo serviços de:
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>Autenticação e armazenamento de dados</li>
            <li>Processamento de pagamentos</li>
            <li>Verificação de documentos e antecedentes</li>
            <li>Envio de comunicações por e-mail</li>
            <li>Análise de uso e melhorias da plataforma</li>
            <li>Mapas e localização</li>
          </ul>
          <p className="mt-4">
            Esses parceiros estão sujeitos a contratos que garantem a proteção
            dos seus dados conforme a LGPD. Alguns deles estão localizados fora
            do Brasil, especialmente nos Estados Unidos, e a transferência
            internacional ocorre com base em cláusulas contratuais padrão e
            certificações de privacidade.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            Compartilhamento entre Usuários
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Perfis de profissionais são exibidos para contratantes (dados
              profissionais, foto, biografia)
            </li>
            <li>
              Apenas o <strong>primeiro nome</strong> é exibido para
              contratantes, nunca o nome completo
            </li>
            <li>
              Mensagens trocadas pelo chat são visíveis apenas para os
              participantes da conversa
            </li>
            <li>
              Avaliações são públicas após o período de revisão ou resposta
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            Não Comercializamos seus Dados
          </h3>
          <p className="mt-2">
            A Cuidly <strong>não vende, aluga ou comercializa</strong> dados
            pessoais de seus usuários para terceiros. O compartilhamento ocorre
            apenas para viabilizar os serviços descritos nesta política.
          </p>
        </section>

        {/* 6. Segurança */}
        <section id="seguranca">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            6. Segurança dos Dados
          </h2>
          <p className="mt-4">
            Adotamos medidas técnicas e organizacionais para proteger seus dados
            pessoais contra acesso não autorizado, perda, alteração ou
            destruição. Isso inclui:
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>Criptografia de dados sensíveis</li>
            <li>Comunicações seguras (HTTPS)</li>
            <li>Controle de acesso baseado em funções</li>
            <li>Monitoramento e logs de auditoria</li>
            <li>Treinamento da equipe em proteção de dados</li>
            <li>Procedimentos de resposta a incidentes</li>
          </ul>
        </section>

        {/* 7. Retenção */}
        <section id="retencao">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            7. Retenção de Dados
          </h2>
          <p className="mt-4">
            Os dados pessoais são mantidos pelo tempo necessário para cumprir as
            finalidades para as quais foram coletados ou conforme exigido por
            lei:
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Tipo de Dado
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Período de Retenção
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Justificativa
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Dados de conta ativa
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Durante a vigência da conta
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Execução do contrato
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dados após exclusão de conta
                  </td>
                  <td className="border border-gray-300 px-4 py-2">30 dias</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Possibilidade de recuperação
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Dados de pagamento e fiscais
                  </td>
                  <td className="border border-gray-300 px-4 py-2">5 anos</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Obrigação fiscal e contábil
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Logs de auditoria
                  </td>
                  <td className="border border-gray-300 px-4 py-2">2 anos</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Segurança e compliance
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Resultados de verificação
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    30 dias (cache)
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Performance e custos
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dados de analytics
                  </td>
                  <td className="border border-gray-300 px-4 py-2">14 meses</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Anonimizados após este período
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Mensagens de chat
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Durante a conta ativa
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    Execução do contrato
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. Direitos */}
        <section id="direitos">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            8. Direitos dos Titulares
          </h2>
          <p className="mt-4">
            Conforme a LGPD, você tem os seguintes direitos em relação aos seus
            dados pessoais:
          </p>

          <ul className="mt-4 ml-6 list-disc space-y-3">
            <li>
              <strong>Confirmação e acesso:</strong> confirmar a existência de
              tratamento e acessar seus dados pessoais
            </li>
            <li>
              <strong>Correção:</strong> corrigir dados incompletos, inexatos ou
              desatualizados
            </li>
            <li>
              <strong>Anonimização, bloqueio ou eliminação:</strong> solicitar
              anonimização ou eliminação de dados desnecessários, excessivos ou
              tratados em desconformidade com a LGPD
            </li>
            <li>
              <strong>Portabilidade:</strong> solicitar a transferência dos seus
              dados para outro fornecedor de serviço (formato JSON ou CSV)
            </li>
            <li>
              <strong>Eliminação de dados com consentimento:</strong> solicitar
              a eliminação de dados pessoais tratados com base no seu
              consentimento
            </li>
            <li>
              <strong>Informação sobre compartilhamento:</strong> ser informado
              sobre as entidades públicas e privadas com as quais compartilhamos
              dados
            </li>
            <li>
              <strong>Revogação de consentimento:</strong> revogar o
              consentimento a qualquer momento, sem afetar tratamentos
              anteriores
            </li>
            <li>
              <strong>Oposição:</strong> opor-se a tratamento realizado com base
              em interesse legítimo, se houver descumprimento da LGPD
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            8.1 Como Exercer seus Direitos
          </h3>
          <p className="mt-2">
            Para exercer qualquer um desses direitos, entre em contato com nosso
            Encarregado de Proteção de Dados (DPO):
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              <strong>E-mail:</strong>{' '}
              <a
                href="mailto:dpo@cuidly.com"
                className="text-fuchsia-600 hover:text-fuchsia-700"
              >
                dpo@cuidly.com
              </a>
            </li>
            <li>
              <strong>Prazo de resposta:</strong> até 15 dias úteis
            </li>
          </ul>
          <p className="mt-4 text-sm italic">
            Nota: Alguns dados podem ser retidos mesmo após solicitação de
            exclusão, quando houver obrigação legal de mantê-los (ex.: dados
            fiscais, registros de verificação de antecedentes para defesa em
            processos judiciais).
          </p>
        </section>

        {/* 9. Crianças */}
        <section id="crianças">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            9. Dados de Crianças e Adolescentes
          </h2>
          <p className="mt-4">
            Conforme a LGPD, o tratamento de dados pessoais de crianças deve ser
            realizado em seu melhor interesse e com consentimento específico de
            pelo menos um dos pais ou responsável legal.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            9.1 Como Tratamos Dados de Crianças
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-2">
            <li>
              Coletamos dados de crianças <strong>apenas</strong> mediante
              consentimento específico do responsável legal (pai, mãe ou
              guardião)
            </li>
            <li>
              Os dados coletados são limitados ao{' '}
              <strong>mínimo necessário</strong> para viabilizar a contratação
              de babás
            </li>
            <li>
              <strong>Não utilizamos</strong> dados de crianças para fins de
              marketing, perfilagem ou publicidade direcionada
            </li>
            <li>
              O responsável pode solicitar a visualização e exclusão dos dados
              de seus filhos a qualquer momento
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            9.2 Finalidade dos Dados de Crianças
          </h3>
          <p className="mt-2">
            Os dados das crianças são utilizados exclusivamente para:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Permitir que profissionais entendam as necessidades específicas de
              cuidado
            </li>
            <li>
              Informar sobre alergias, necessidades especiais ou rotinas
              importantes
            </li>
            <li>
              Facilitar o matching entre contratantes e profissionais
              qualificados
            </li>
          </ul>
        </section>

        {/* 10. Atualizações */}
        <section id="atualizacoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            10. Atualizações desta Política
          </h2>
          <p className="mt-4">
            Esta Política de Privacidade pode ser atualizada periodicamente para
            refletir mudanças em nossas práticas ou na legislação aplicável.
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              A data da última atualização será sempre indicada no topo desta
              página
            </li>
            <li>
              Alterações substanciais serão comunicadas por e-mail ou notificação
              na plataforma
            </li>
            <li>
              O uso continuado da plataforma após as alterações constitui
              aceitação da nova política
            </li>
            <li>
              Versões anteriores podem ser solicitadas pelo e-mail do DPO
            </li>
          </ul>
        </section>

        {/* 11. Contato */}
        <section id="contato">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            11. Contato
          </h2>
          <p className="mt-4">
            Se você tiver dúvidas, preocupações ou solicitações relacionadas a
            esta Política de Privacidade ou ao tratamento dos seus dados
            pessoais, entre em contato:
          </p>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ul className="space-y-2">
              <li>
                <strong>Questões gerais:</strong>{' '}
                <a
                  href="https://cuidly.com/app/suporte"
                  className="text-fuchsia-600 hover:text-fuchsia-700"
                >
                  cuidly.com/app/suporte
                </a>
              </li>
              <li>
                <strong>Privacidade e LGPD:</strong>{' '}
                <a
                  href="mailto:dpo@cuidly.com"
                  className="text-fuchsia-600 hover:text-fuchsia-700"
                >
                  dpo@cuidly.com
                </a>
              </li>
              <li>
                <strong>Encarregado (DPO):</strong> Lucas Furlan
              </li>
            </ul>
          </div>
          <p className="mt-4 text-sm">
            Você também pode registrar reclamações junto à Autoridade Nacional
            de Proteção de Dados (ANPD) caso entenda que seus direitos não foram
            adequadamente atendidos.
          </p>
        </section>
      </div>
    </article>
  );
}
