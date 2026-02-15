import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso | Cuidly',
  description:
    'Termos de uso da Cuidly. Conheça as regras e condições para utilização da plataforma.',
};

export default function TermsOfUsePage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Atualizado em 29/01/2026
        </p>
      </div>

      {/* Índice */}
      <nav className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Índice</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
          <li>
            <a href="#aceitação" className="hover:text-fuchsia-600">
              Aceitação dos Termos
            </a>
          </li>
          <li>
            <a href="#descricao" className="hover:text-fuchsia-600">
              Descrição do Serviço
            </a>
          </li>
          <li>
            <a href="#cadastro" className="hover:text-fuchsia-600">
              Cadastro e Conta
            </a>
          </li>
          <li>
            <a href="#planos" className="hover:text-fuchsia-600">
              Planos e Assinaturas
            </a>
          </li>
          <li>
            <a href="#verificacoes" className="hover:text-fuchsia-600">
              Verificações de Segurança
            </a>
          </li>
          <li>
            <a href="#conduta" className="hover:text-fuchsia-600">
              Conduta do Usuário
            </a>
          </li>
          <li>
            <a href="#comunicacao" className="hover:text-fuchsia-600">
              Comunicação entre Usuários
            </a>
          </li>
          <li>
            <a href="#avaliacoes" className="hover:text-fuchsia-600">
              Avaliações
            </a>
          </li>
          <li>
            <a href="#propriedade" className="hover:text-fuchsia-600">
              Propriedade Intelectual
            </a>
          </li>
          <li>
            <a href="#responsabilidades" className="hover:text-fuchsia-600">
              Responsabilidades e Limitações
            </a>
          </li>
          <li>
            <a href="#suspensao" className="hover:text-fuchsia-600">
              Suspensão e Encerramento
            </a>
          </li>
          <li>
            <a href="#disputas" className="hover:text-fuchsia-600">
              Disputas e Foro
            </a>
          </li>
          <li>
            <a href="#disposicoes" className="hover:text-fuchsia-600">
              Disposições Gerais
            </a>
          </li>
          <li>
            <a href="#alteracoes" className="hover:text-fuchsia-600">
              Alterações dos Termos
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
          Estes Termos de Uso regulam o acesso e uso da plataforma Cuidly (
          <Link
            href="/"
            className="text-fuchsia-600 underline transition-colors hover:text-fuchsia-700"
          >
            cuidly.com
          </Link>
          ), por pessoas que buscam ou oferecem serviços de cuidado infantil. Ao
          utilizar a plataforma, você concorda integralmente com estes termos.
        </p>

        {/* 1. Aceitação */}
        <section id="aceitação">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            1. Aceitação dos Termos
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              Ao se cadastrar ou utilizar qualquer funcionalidade da plataforma,
              o usuário declara estar de acordo com estes Termos de Uso e com
              nossa{' '}
              <Link
                href="/termos/politica-de-privacidade"
                className="text-fuchsia-600 underline hover:text-fuchsia-700"
              >
                Política de Privacidade
              </Link>
              .
            </li>
            <li>
              O aceite é registrado com o endereço IP e data/hora da aceitação
              para fins de comprovação.
            </li>
            <li>
              Caso não concorde com algum termo, você não deve utilizar a
              plataforma.
            </li>
            <li>
              A Cuidly pode recusar cadastros que estejam em desacordo com suas
              políticas ou com a legislação vigente.
            </li>
          </ul>
        </section>

        {/* 2. Descrição do Serviço */}
        <section id="descricao">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            2. Descrição do Serviço
          </h2>
          <p className="mt-4">
            A Cuidly é uma <strong>plataforma que conecta</strong> pessoas que
            buscam profissionais de cuidado infantil a profissionais da área.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            2.1 O que a Cuidly faz
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Disponibiliza uma plataforma para cadastro de usuários</li>
            <li>Oferece ferramentas de busca e filtros para encontrar profissionais</li>
            <li>Permite a criação de vagas de emprego por contratantes</li>
            <li>
              Facilita a comunicação entre usuários através de chat interno
            </li>
            <li>
              Fornece verificações de identidade e antecedentes criminais
              (opcional/pago)
            </li>
            <li>Permite avaliações mútuas entre usuários</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            2.2 O que a Cuidly NÃO faz
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              <strong>NÃO é empregadora</strong> dos profissionais cadastrados
            </li>
            <li>
              <strong>NÃO garante</strong> a qualidade dos serviços prestados
              pelos profissionais
            </li>
            <li>
              <strong>NÃO é responsável</strong> por questões trabalhistas entre
              contratantes e profissionais
            </li>
            <li>
              <strong>NÃO intermedia</strong> pagamentos de salários ou
              remuneração entre contratantes e profissionais
            </li>
            <li>
              <strong>NÃO oferece garantia absoluta</strong> de que as
              verificações eliminem todos os riscos
            </li>
          </ul>
        </section>

        {/* 3. Cadastro */}
        <section id="cadastro">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            3. Cadastro e Conta
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.1 Requisitos para Profissionais (Babás)
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Ter 18 (dezoito) anos completos ou mais</li>
            <li>Possuir documento de identidade válido (RG ou CNH)</li>
            <li>Possuir CPF válido e regular</li>
            <li>Fornecer informações verdadeiras e atualizadas</li>
            <li>Aceitar passar pela verificação de identidade</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.2 Requisitos para Contratantes (Pais)
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Ser maior de 18 anos ou representante legal</li>
            <li>Fornecer informações verdadeiras sobre as crianças</li>
            <li>Ser responsável pela decisão final de contratação</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            3.3 Segurança da Conta
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              O usuário é responsável por manter suas credenciais de acesso
              seguras
            </li>
            <li>A conta é de uso pessoal e intransferível</li>
            <li>
              Em caso de uso não autorizado, o usuário deve comunicar
              imediatamente à Cuidly
            </li>
            <li>
              A Cuidly não se responsabiliza por acessos não autorizados
              decorrentes de negligência do usuário
            </li>
          </ul>
        </section>

        {/* 4. Planos */}
        <section id="planos">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            4. Planos e Assinaturas
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            4.1 Planos Disponíveis
          </h3>
          <p className="mt-4">
            A Cuidly oferece planos gratuitos e pagos, com diferentes níveis de
            recursos. Para informações detalhadas e sempre atualizadas sobre
            cada plano, consulte nossa{' '}
            <Link
              href="/app/assinatura"
              className="text-fuchsia-600 underline hover:text-fuchsia-700"
            >
              página de assinatura
            </Link>
            . Ao assinar, você concorda com os recursos descritos nesta seção
            conforme vigentes na data da contratação.
          </p>

          <h4 className="mt-6 text-lg font-semibold text-gray-800">
            4.1.1 Planos para Famílias
          </h4>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h5 className="font-semibold text-gray-900">
                CUIDLY FREE (Gratuito)
              </h5>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-sm">
                <li>Perfis completos de babás</li>
                <li>Busca com todos os filtros disponíveis</li>
                <li>Visualização de selos de verificação</li>
                <li>1 vaga ativa (7 dias de duração)</li>
                <li>1 conversa ativa no chat</li>
                <li>Avaliar babás após contratação</li>
                <li>Favoritar perfis</li>
              </ul>
            </div>

            <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4">
              <h5 className="font-semibold text-fuchsia-900">
                CUIDLY PLUS (Pago)
              </h5>
              <p className="mt-1 text-sm text-fuchsia-800">
                <strong>Preço:</strong> R$ 47/mês ou R$ 94/trimestre
                (promocional) | R$ 59/mês ou R$ 119/trimestre (normal)
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-fuchsia-900">
                <li>Tudo do plano Free</li>
                <li>Chat ilimitado</li>
                <li>Matching inteligente de vagas</li>
                <li>1 boost de vaga por mês (7 dias em destaque)</li>
                <li>Até 3 vagas ativas simultâneas (30 dias cada)</li>
                <li>Avaliações completas das babás</li>
                <li>Notificações prioritárias</li>
              </ul>
            </div>
          </div>

          <h4 className="mt-6 text-lg font-semibold text-gray-800">
            4.1.2 Planos para Babás (Profissionais)
          </h4>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h5 className="font-semibold text-gray-900">
                CUIDLY BÁSICO (Gratuito)
              </h5>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-sm">
                <li>Perfil público completo</li>
                <li>Selo Identificada (após validações)</li>
                <li>Visualização de vagas disponíveis</li>
                <li>Candidatura a vagas</li>
                <li>Mensagem de apresentação na candidatura</li>
                <li>Chat para responder famílias</li>
                <li>Avaliar famílias após trabalho</li>
              </ul>
            </div>

            <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4">
              <h5 className="font-semibold text-fuchsia-900">
                CUIDLY PRO (Pago)
              </h5>
              <p className="mt-1 text-sm text-fuchsia-800">
                <strong>Preço:</strong> R$ 19/mês ou R$ 119/ano
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-fuchsia-900">
                <li>Tudo do plano Básico</li>
                <li>Chat liberado após candidatura</li>
                <li>Selo Verificada (quando elegível)</li>
                <li>Selo Confiável (quando elegível)</li>
                <li>Perfil em destaque nas buscas</li>
                <li>Matching prioritário</li>
              </ul>
            </div>
          </div>

          <h3 className="mt-8 text-xl font-semibold text-gray-800">
            4.2 Selos de Verificação
          </h3>
          <p className="mt-4">
            A Cuidly oferece um sistema de selos que indicam diferentes níveis
            de verificação para profissionais. Os selos não representam
            garantias absolutas, mas ferramentas adicionais para auxiliar na
            decisão de contratação.
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              <strong>IDENTIFICADA:</strong> disponível no plano gratuito após
              validação de identidade
            </li>
            <li>
              <strong>VERIFICADA:</strong> disponível no plano Pro após
              validações adicionais de segurança
            </li>
            <li>
              <strong>CONFIÁVEL:</strong> disponível no plano Pro após
              conquistar avaliações positivas de famílias
            </li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold text-gray-800">
            4.3 Pagamentos e Renovação
          </h3>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              Assinaturas são cobradas de forma recorrente e automática
            </li>
            <li>
              Métodos de pagamento aceitos: PIX, cartão de crédito, boleto
              bancário
            </li>
            <li>
              A renovação ocorre automaticamente ao final de cada período
            </li>
            <li>
              O cancelamento pode ser feito a qualquer momento pelo painel do
              usuário
            </li>
            <li>
              Após o cancelamento, o acesso aos recursos pagos permanece até o
              fim do período já pago
            </li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold text-gray-800">
            4.4 Política de Reembolso
          </h3>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              Reembolso integral em caso de erro de cobrança comprovado pela
              plataforma
            </li>
            <li>
              Reembolso proporcional em caso de problema técnico que impeça o
              uso do serviço
            </li>
            <li>
              Não há reembolso por desistência após 7 dias do início da
              assinatura
            </li>
            <li>
              Períodos de trial gratuito, quando disponíveis, não geram cobrança
              se cancelados antes do término
            </li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold text-gray-800">
            4.5 Alteração de Planos e Preços
          </h3>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              A Cuidly pode alterar preços e recursos dos planos mediante aviso
              prévio de 30 (trinta) dias
            </li>
            <li>
              Preços promocionais são temporários e a plataforma informará
              quando voltarem ao preço normal
            </li>
            <li>
              Usuários que assinaram em período promocional mantêm o preço até
              cancelamento ou mudança voluntária de plano
            </li>
            <li>
              Upgrade de plano entra em vigor imediatamente com cobrança
              proporcional do valor adicional
            </li>
            <li>
              Downgrade de plano entra em vigor no próximo ciclo de cobrança
            </li>
          </ul>
        </section>

        {/* 5. Verificações */}
        <section id="verificacoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            5. Verificações de Segurança
          </h2>
          <p className="mt-4">
            A Cuidly oferece um sistema de selos para ajudar a identificar
            profissionais verificados. Os selos indicam diferentes níveis de
            verificação, incluindo validação de documentos, verificação facial e
            consulta de antecedentes.
          </p>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-800">Importante:</p>
            <ul className="mt-2 ml-6 list-disc space-y-1 text-amber-800">
              <li>
                As verificações são baseadas em dados públicos e informações
                fornecidas pelos profissionais
              </li>
              <li>
                A Cuidly <strong>não garante</strong> a ausência absoluta de
                riscos
              </li>
              <li>
                Os contratantes devem realizar sua própria avaliação e
                entrevistas antes de contratar
              </li>
              <li>
                Os selos indicam um nível de verificação, não uma recomendação
                ou garantia da Cuidly
              </li>
            </ul>
          </div>
        </section>

        {/* 6. Conduta */}
        <section id="conduta">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            6. Conduta do Usuário
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            6.1 Proibições Gerais
          </h3>
          <p className="mt-2">
            É expressamente proibido a todos os usuários:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Fornecer informações falsas, incompletas ou enganosas</li>
            <li>
              Utilizar a plataforma para fins ilegais ou em desacordo com a
              legislação brasileira
            </li>
            <li>
              Assediar, ameaçar, difamar ou discriminar outros usuários
            </li>
            <li>
              Coletar dados de outros usuários para fins não autorizados
            </li>
            <li>
              Tentar burlar ou comprometer os sistemas de segurança da
              plataforma
            </li>
            <li>
              Criar múltiplas contas para burlar restrições ou obter vantagens
              indevidas
            </li>
            <li>
              Utilizar bots, scrapers ou ferramentas automatizadas para acessar
              a plataforma
            </li>
            <li>
              Publicar conteúdo que viole direitos autorais ou propriedade
              intelectual de terceiros
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            6.2 Proibições Específicas para Profissionais (Babás)
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Oferecer serviços fora das categorias permitidas pela plataforma
            </li>
            <li>
              Falsificar certificações, experiências ou qualificações
            </li>
            <li>
              Solicitar pagamentos fora da plataforma durante a negociação
              inicial
            </li>
            <li>
              Prestar serviços a famílias conhecidas através da plataforma sem o
              devido contato prévio
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            6.3 Proibições Específicas para Contratantes (Pais)
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Criar vagas falsas ou enganosas</li>
            <li>Solicitar serviços ilegais ou inadequados</li>
            <li>
              Discriminar candidatas por motivos não relacionados às
              qualificações profissionais
            </li>
            <li>
              Não cumprir com condições acordadas de trabalho (horários,
              remuneração, etc.)
            </li>
          </ul>
        </section>

        {/* 7. Comunicação */}
        <section id="comunicacao">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            7. Comunicação entre Usuários
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            7.1 Chat da Plataforma
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Toda comunicação inicial entre usuários deve ocorrer pelo chat
              interno da plataforma
            </li>
            <li>
              As mensagens podem ser moderadas em caso de denúncia de violação
              destes termos
            </li>
            <li>
              A Cuidly não monitora proativamente o conteúdo das mensagens, mas
              pode acessá-las mediante ordem judicial ou para investigar
              denúncias
            </li>
            <li>
              O limite de mensagens varia conforme o plano contratado
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            7.2 Denúncias
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              Usuários podem denunciar comportamentos inadequados através do
              próprio chat ou perfil
            </li>
            <li>
              Denúncias são analisadas pela equipe de moderação da Cuidly
            </li>
            <li>
              Medidas podem incluir advertência, suspensão temporária ou
              banimento permanente
            </li>
            <li>
              Denúncias falsas ou abusivas podem resultar em penalidades para o
              denunciante
            </li>
          </ul>
        </section>

        {/* 8. Avaliações */}
        <section id="avaliacoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            8. Avaliações
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              O sistema de avaliações é bidirecional: contratantes avaliam
              profissionais e profissionais avaliam contratantes
            </li>
            <li>
              Avaliações são publicadas após ambas as partes avaliarem ou após
              14 dias da conclusão do contato
            </li>
            <li>
              É permitido responder às avaliações recebidas
            </li>
            <li>
              Avaliações devem ser baseadas em experiências reais na plataforma
            </li>
            <li>
              Avaliações falsas, manipuladas ou que violem estes termos serão
              removidas
            </li>
            <li>
              A Cuidly se reserva o direito de moderar avaliações que contenham
              conteúdo ofensivo, discriminatório ou ilegal
            </li>
          </ul>
        </section>

        {/* 9. Propriedade Intelectual */}
        <section id="propriedade">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            9. Propriedade Intelectual
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            9.1 Propriedade da Cuidly
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              A marca Cuidly, logotipos, design, códigos e conteúdos originais
              são propriedade exclusiva da Cuidly
            </li>
            <li>
              É proibida a reprodução, distribuição ou uso comercial sem
              autorização expressa
            </li>
            <li>
              O uso da plataforma não confere ao usuário nenhum direito sobre a
              propriedade intelectual da Cuidly
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            9.2 Conteúdo do Usuário
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              O usuário mantém a propriedade do conteúdo que produz (textos,
              fotos, etc.)
            </li>
            <li>
              Ao publicar conteúdo na plataforma, o usuário concede à Cuidly uma
              licença não exclusiva para exibição
            </li>
            <li>
              A Cuidly pode utilizar depoimentos anonimizados para fins de
              marketing, mediante consentimento
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            9.3 Uso de Inteligência Artificial
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              A plataforma oferece recursos de geração de texto por IA (ex.:
              biografias)
            </li>
            <li>
              O uso desses recursos é opcional e requer consentimento do usuário
            </li>
            <li>
              O conteúdo gerado por IA pode ser editado pelo usuário antes da
              publicação
            </li>
          </ul>
        </section>

        {/* 10. Responsabilidades */}
        <section id="responsabilidades">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            10. Responsabilidades e Limitações
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            10.1 Responsabilidades da Cuidly
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Manter a plataforma funcionando e acessível</li>
            <li>Processar as verificações contratadas de forma diligente</li>
            <li>
              Proteger os dados pessoais conforme a LGPD e nossa Política de
              Privacidade
            </li>
            <li>Mediar disputas entre usuários quando solicitado</li>
            <li>
              Fornecer suporte ao cliente para dúvidas e problemas com a
              plataforma
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            10.2 Isenções de Responsabilidade
          </h3>
          <p className="mt-2">
            A Cuidly <strong>NÃO</strong> é responsável por:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Qualidade dos serviços prestados pelos profissionais</li>
            <li>Comportamento de usuários fora da plataforma</li>
            <li>
              Danos decorrentes de relações trabalhistas entre contratantes e
              profissionais
            </li>
            <li>Informações falsas fornecidas por usuários</li>
            <li>
              Interrupções de serviço por força maior, manutenção programada ou
              falhas de terceiros
            </li>
            <li>Decisões de contratação tomadas pelos contratantes</li>
            <li>
              Perdas ou danos indiretos, incidentais ou consequentes
            </li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            10.3 Limitação de Responsabilidade
          </h3>
          <p className="mt-2">
            Em qualquer hipótese, a responsabilidade da Cuidly estará limitada
            ao valor total pago pelo usuário nos últimos 12 (doze) meses
            anteriores ao evento que originou a reclamação.
          </p>
        </section>

        {/* 11. Suspensão */}
        <section id="suspensao">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            11. Suspensão e Encerramento
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            11.1 Suspensão ou Encerramento pela Cuidly
          </h3>
          <p className="mt-2">
            A Cuidly pode suspender ou encerrar a conta de um usuário nos
            seguintes casos:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Violação destes Termos de Uso</li>
            <li>Denúncias verificadas de comportamento inadequado</li>
            <li>Atividade suspeita de fraude ou uso indevido</li>
            <li>Solicitação de autoridades competentes</li>
            <li>Fornecimento de informações falsas no cadastro</li>
            <li>Inatividade prolongada (mais de 24 meses sem acesso)</li>
          </ul>

          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            11.2 Encerramento pelo Usuário
          </h3>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>
              O usuário pode solicitar o encerramento de sua conta a qualquer
              momento
            </li>
            <li>
              A solicitação pode ser feita pelo painel do usuário ou pelo e-mail
              de suporte
            </li>
            <li>
              Os dados serão retidos conforme nossa Política de Privacidade e
              obrigações legais
            </li>
            <li>
              Assinaturas ativas podem ser mantidas até o fim do período pago
            </li>
          </ul>
        </section>

        {/* 12. Disputas */}
        <section id="disputas">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            12. Disputas e Foro
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              Em caso de disputa, as partes devem primeiro tentar uma resolução
              amigável através do suporte da Cuidly
            </li>
            <li>
              Estes Termos são regidos exclusivamente pela legislação brasileira
            </li>
            <li>
              Fica eleito o foro da Comarca de <strong>Barueri/SP</strong> para
              dirimir quaisquer controvérsias
            </li>
            <li>
              Para disputas envolvendo valores acima de 40 (quarenta) salários
              mínimos, as partes podem optar por arbitragem
            </li>
          </ul>
        </section>

        {/* 13. Disposições */}
        <section id="disposicoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            13. Disposições Gerais
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              <strong>Independência das cláusulas:</strong> a invalidade de uma
              cláusula não afeta as demais
            </li>
            <li>
              <strong>Tolerância:</strong> a tolerância quanto ao descumprimento
              de qualquer cláusula não implica renúncia do direito
            </li>
            <li>
              <strong>Comunicações:</strong> comunicações oficiais serão
              enviadas para o e-mail cadastrado pelo usuário
            </li>
            <li>
              <strong>Integralidade:</strong> estes Termos constituem o acordo
              integral entre o usuário e a Cuidly
            </li>
            <li>
              <strong>Cessão:</strong> o usuário não pode ceder seus direitos ou
              obrigações sem autorização da Cuidly
            </li>
          </ul>
        </section>

        {/* 14. Alterações */}
        <section id="alteracoes">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            14. Alterações dos Termos
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              A Cuidly pode atualizar estes Termos de Uso a qualquer momento
            </li>
            <li>
              Alterações substanciais serão comunicadas com antecedência mínima
              de 30 (trinta) dias
            </li>
            <li>
              A comunicação será feita por e-mail e/ou notificação na plataforma
            </li>
            <li>
              O uso continuado da plataforma após as alterações constitui
              aceitação dos novos termos
            </li>
            <li>
              Caso não concorde com as alterações, o usuário pode encerrar sua
              conta sem penalidades
            </li>
            <li>
              A data da última atualização será sempre indicada no topo desta
              página
            </li>
          </ul>
        </section>

        {/* 15. Contato */}
        <section id="contato">
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            15. Contato
          </h2>
          <p className="mt-4">
            Para dúvidas ou solicitações relacionadas a estes Termos de Uso,
            entre em contato:
          </p>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ul className="space-y-2">
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
                <strong>Endereço:</strong> Alameda Rio Negro, 503 - Sala 2020 -
                Alphaville Industrial, Barueri/SP - CEP 06454-000
              </li>
              <li>
                <strong>CNPJ:</strong> 63.813.138/0001-20
              </li>
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
