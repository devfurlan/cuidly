import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Cookies | Cuidly',
  description:
    'Entenda como a Cuidly utiliza cookies e tecnologias similares para melhorar sua experiência na plataforma.',
};

export default function CookiesPolicyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Política de Cookies
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualizado em 26/01/2026
        </p>
      </div>

      <div className="space-y-6 text-gray-700">
        <p>
          Esta Política de Cookies explica como a Cuidly utiliza cookies e
          tecnologias similares quando você visita nosso site.
        </p>

        {/* 1. O que são Cookies */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            O que são Cookies
          </h2>
          <p className="mt-4">
            Cookies são pequenos arquivos de texto armazenados no seu
            dispositivo quando você visita um site. Eles são utilizados para
            manter você conectado, lembrar suas preferências e melhorar sua
            experiência de navegação.
          </p>
        </section>

        {/* 2. Cookies que Utilizamos */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Cookies que Utilizamos
          </h2>

          <h3 className="mt-6 text-lg font-semibold text-gray-800">
            Cookies Essenciais
          </h3>
          <p className="mt-2">
            São necessários para o funcionamento do site e não podem ser
            desativados. Incluem cookies de autenticação e proteção de
            segurança. Sem eles, você não conseguiria fazer login ou usar a
            plataforma.
          </p>

          <h3 className="mt-6 text-lg font-semibold text-gray-800">
            Cookies de Analytics
          </h3>
          <p className="mt-2">
            Utilizamos o Google Analytics para entender como os visitantes usam
            nosso site. Esses cookies coletam informações de forma anônima, como
            páginas visitadas e tempo de permanência. Eles só são ativados com
            seu consentimento.
          </p>

          <h3 className="mt-6 text-lg font-semibold text-gray-800">
            Cookies de Marketing
          </h3>
          <p className="mt-2">
            Podemos utilizar cookies de marketing (como Google Ads e Meta Pixel)
            para campanhas publicitárias. Esses cookies também requerem seu
            consentimento prévio.
          </p>
        </section>

        {/* 3. Gerenciamento */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Como Gerenciar seus Cookies
          </h2>
          <p className="mt-4">
            Ao visitar nosso site pela primeira vez, você verá um banner onde
            pode aceitar ou recusar cookies não essenciais. Você pode alterar
            suas preferências a qualquer momento nas configurações do seu
            navegador.
          </p>
          <p className="mt-4">
            Se recusar cookies de analytics, o site continuará funcionando
            normalmente - apenas deixaremos de coletar dados sobre seu uso.
          </p>
        </section>

        {/* 4. Tecnologias Similares */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Outras Tecnologias
          </h2>
          <p className="mt-4">
            Além de cookies, utilizamos Local Storage para salvar preferências e
            dados de formulários em andamento. Também podemos usar web beacons
            (pixels) em e-mails para confirmar entregas e medir engajamento.
          </p>
        </section>

        {/* 5. Terceiros */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">
            Serviços de Terceiros
          </h2>
          <p className="mt-4">
            Alguns cookies são definidos por serviços que utilizamos. Para mais
            informações, consulte as políticas de privacidade:
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia-600 underline hover:text-fuchsia-700"
              >
                Google (Analytics, Maps)
              </a>
            </li>
            <li>
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia-600 underline hover:text-fuchsia-700"
              >
                Supabase (Autenticação)
              </a>
            </li>
          </ul>
        </section>

        {/* 6. Contato */}
        <section>
          <h2 className="mt-8 text-2xl font-semibold text-gray-900">Contato</h2>
          <p className="mt-4">
            Se tiver dúvidas sobre cookies ou privacidade, entre em contato pelo
            e-mail{' '}
            <a
              href="mailto:dpo@cuidly.com"
              className="text-fuchsia-600 hover:text-fuchsia-700"
            >
              dpo@cuidly.com
            </a>
            .
          </p>
          <p className="mt-4 text-sm">
            Para mais detalhes sobre o tratamento de dados pessoais, consulte
            nossa{' '}
            <Link
              href="/termos/politica-de-privacidade"
              className="text-fuchsia-600 underline hover:text-fuchsia-700"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
