import { PiBriefcase, PiCheckCircle, PiMedal, PiShieldCheck, PiTrendUp } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import Link from 'next/link';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';

export default function BabasPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-blue-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Impulsione sua Carreira como Babá
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Conecte-se com famílias de qualidade, receba o Selo de Verificação
                e tenha acesso a vagas exclusivas. Tudo isso gratuitamente!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cadastro?type=nanny">
                  <Button size="lg" className="w-full sm:w-auto">
                    Cadastrar Grátis
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                100% Grátis • Selo de Verificação Incluído • Acesso a Vagas
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-200 rounded-lg h-96 flex items-center justify-center">
                <p className="text-blue-600">Imagem: Babá profissional com criança</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Gratuitos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              O que você ganha GRÁTIS
            </h2>
            <p className="text-gray-600">
              Diferente de outras plataformas, aqui você tem benefícios reais sem pagar nada
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border-2 border-green-500">
              <PiShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Selo de Verificação</h3>
              <p className="text-gray-600">
                Validação de antecedentes criminais GRÁTIS. Aumente sua credibilidade
                e seja escolhida por mais famílias.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-green-500">
              <PiBriefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Acesso a Vagas</h3>
              <p className="text-gray-600">
                Veja vagas publicadas por famílias e receba contatos diretamente.
                Receba notificações de novas oportunidades.
              </p>
            </Card>

            <Card className="p-6 text-center border-2 border-green-500">
              <PiTrendUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Avaliar Famílias</h3>
              <p className="text-gray-600">
                Avalie famílias após trabalhar com elas.
                Ajude outras babás a fazer escolhas melhores.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Plano Pro */}
      <section className="bg-linear-to-br from-pink to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <PiMedal className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">
              Babá Pro: R$ {PLAN_PRICES.NANNY_PRO.MONTH.price}/mês
            </h2>
            <p className="text-xl opacity-90">
              Ou R$ {PLAN_PRICES.NANNY_PRO.YEAR.price}/ano
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Candidatar-se a Vagas</h3>
                <p className="text-sm opacity-90">Envie candidaturas diretamente para famílias</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Selo Verificada</h3>
                <p className="text-sm opacity-90">Destaque-se da concorrência</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Validação Completa</h3>
                <p className="text-sm opacity-90">Documentos + antecedentes criminais</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Perfil em Destaque</h3>
                <p className="text-sm opacity-90">Apareça primeiro nas buscas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Matching Prioritário</h3>
                <p className="text-sm opacity-90">Receba vagas compatíveis primeiro</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PiCheckCircle className="w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Mensagens Ilimitadas</h3>
                <p className="text-sm opacity-90">Converse livremente com as famílias</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/cadastro?type=nanny">
              <Button size="lg" variant="secondary">
                Cadastrar e Conhecer o Plano Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como Começar
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-pink text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2">Cadastre-se</h3>
              <p className="text-gray-600 text-sm">
                Crie seu perfil completo em 5 minutos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2">Seja Verificada</h3>
              <p className="text-gray-600 text-sm">
                Receba o Selo de Verificação gratuitamente
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2">Candidate-se a Vagas</h3>
              <p className="text-gray-600 text-sm">
                Veja vagas e envie propostas para famílias
              </p>
            </div>

            <div className="text-center">
              <div className="bg-pink text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold mb-2">Seja Contratada</h3>
              <p className="text-gray-600 text-sm">
                Receba contatos de famílias interessadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Histórias de Sucesso
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &quot;Consegui 3 entrevistas na primeira semana! O Selo de Verificação
                fez toda a diferença.&quot;
              </p>
              <p className="font-bold">— Carla Mendes, Babá Pro</p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &quot;O plano Pro valeu cada centavo. Minha agenda está sempre cheia
                desde que assinei.&quot;
              </p>
              <p className="font-bold">— Juliana Oliveira, Babá Pro</p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                &quot;Finalmente uma plataforma que valoriza as babás! Recomendo para
                todas as colegas.&quot;
              </p>
              <p className="font-bold">— Fernanda Lima, Babá Verificada</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-pink text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronta para dar o próximo passo na sua carreira?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Cadastre-se grátis e comece a receber oportunidades hoje
          </p>
          <Link href="/cadastro?type=nanny">
            <Button size="lg" variant="secondary">
              Cadastrar Agora
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
