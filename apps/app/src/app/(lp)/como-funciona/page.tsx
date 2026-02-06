import { PiChatCircle, PiFileText, PiMagnifyingGlass, PiShieldCheck, PiStar, PiUserPlus } from 'react-icons/pi';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import { PLAN_PRICES, formatPrice } from '@cuidly/core/subscriptions';

export default function ComoFuncionaPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Como Funciona</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Conectar famílias a babás qualificadas nunca foi tão fácil e seguro
        </p>

        {/* Para Famílias */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Para Famílias</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiUserPlus className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Cadastre-se Grátis</h3>
              <p className="text-gray-600">
                Crie sua conta e cadastre o perfil dos seus filhos (idade, necessidades, temperamento)
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiMagnifyingGlass className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Explore ou Crie Vagas</h3>
              <p className="text-gray-600">
                Busque babás compatíveis ou publique uma vaga para receber candidaturas
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiChatCircle className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Entre em Contato</h3>
              <p className="text-gray-600">
                Assine o Cuidly Plus (a partir de {formatPrice(PLAN_PRICES.FAMILY_PLUS.MONTH.price)}/mês) e converse com babás ilimitadamente
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiShieldCheck className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">4. Verifique Credenciais</h3>
              <p className="text-gray-600">
                Todas as babás têm Selo de Verificação com validação de antecedentes
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiFileText className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">5. Veja Babás Validadas</h3>
              <p className="text-gray-600">
                Babás com Selo Verificada têm validação completa (facial + antecedentes criminais)
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiStar className="w-8 h-8 text-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">6. Contrate com Confiança</h3>
              <p className="text-gray-600">
                Faça entrevistas e contrate a babá ideal para sua família
              </p>
            </Card>
          </div>
        </div>

        {/* Para Babás */}
        <div className="bg-gray-50 -mx-4 px-4 py-16 md:mx-0 md:rounded-lg">
          <h2 className="text-3xl font-bold text-center mb-12">Para Babás</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiUserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Cadastre-se Grátis</h3>
              <p className="text-gray-600">
                Crie seu perfil completo com experiência, certificados e disponibilidade
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Seja Verificada (Grátis)</h3>
              <p className="text-gray-600">
                Receba o Selo de Verificação após validação de antecedentes
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiMagnifyingGlass className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Veja Vagas</h3>
              <p className="text-gray-600">
                Acesse vagas publicadas por famílias e candidate-se às que mais combinam com você
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiChatCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">4. Receba Contatos</h3>
              <p className="text-gray-600">
                Famílias interessadas entrarão em contato diretamente com você
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiStar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">5. Destaque-se (Opcional)</h3>
              <p className="text-gray-600">
                Assine o Cuidly Pro ({formatPrice(PLAN_PRICES.NANNY_PRO.MONTH.price)}/mês) para aparecer primeiro
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <PiFileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">6. Seja Contratada</h3>
              <p className="text-gray-600">
                Faça entrevistas e comece a trabalhar com famílias de qualidade
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro">
              <Button size="lg">Sou Família</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="lg" variant="outline">Sou Babá</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
