import { PiHeart, PiShieldCheck, PiTarget } from 'react-icons/pi';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

export default function QuemSomosPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Quem Somos</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos uma plataforma brasileira que conecta famílias a babás qualificadas
            com segurança, tecnologia e preços justos.
          </p>
        </div>

        {/* Nossa História */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
          <div className="prose prose-lg">
            <p className="text-gray-600 mb-4">
              A Cuidly nasceu da experiência real de pais que enfrentaram a dificuldade
              de encontrar babás confiáveis sem pagar os altos preços das agências tradicionais.
            </p>
            <p className="text-gray-600 mb-4">
              Percebemos que o mercado estava dividido entre plataformas baratas mas inseguras
              e agências caras mas confiáveis. Decidimos criar uma terceira via:
              <strong> segurança de agência com preço de marketplace</strong>.
            </p>
            <p className="text-gray-600">
              Hoje, conectamos centenas de famílias a babás verificadas, usando tecnologia
              de matching inteligente e processos rigorosos de validação para garantir a melhor
              experiência para todos.
            </p>
          </div>
        </div>

        {/* Missão, Visão, Valores */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8 text-center">
            <PiTarget className="w-12 h-12 text-pink mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Missão</h3>
            <p className="text-gray-600">
              Facilitar a conexão entre famílias e babás qualificadas,
              oferecendo segurança, tecnologia e preços acessíveis.
            </p>
          </Card>

          <Card className="p-8 text-center">
            <PiHeart className="w-12 h-12 text-pink mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Visão</h3>
            <p className="text-gray-600">
              Ser a plataforma de referência no Brasil para contratação de babás,
              reconhecida pela segurança e qualidade.
            </p>
          </Card>

          <Card className="p-8 text-center">
            <PiShieldCheck className="w-12 h-12 text-pink mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Valores</h3>
            <p className="text-gray-600">
              Segurança, transparência, respeito, inovação e compromisso
              com famílias e profissionais.
            </p>
          </Card>
        </div>

        {/* Diferenciais */}
        <div className="bg-linear-to-br from-pink-50 to-purple-50 -mx-4 px-4 py-16 md:mx-0 md:rounded-lg mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Diferenciais</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Validação Completa</h3>
                <p className="text-gray-600 text-sm">
                  Antecedentes criminais, referências e certificados verificados
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Matching Inteligente</h3>
                <p className="text-gray-600 text-sm">
                  Algoritmo que conecta famílias e babás compatíveis
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Preços Justos</h3>
                <p className="text-gray-600 text-sm">
                  Até 70% mais barato que agências tradicionais
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Suporte Dedicado</h3>
                <p className="text-gray-600 text-sm">
                  Equipe pronta para ajudar famílias e babás
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Transparência Total</h3>
                <p className="text-gray-600 text-sm">
                  Sem taxas escondidas ou cobranças surpresa
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1">Foco no Brasil</h3>
                <p className="text-gray-600 text-sm">
                  Plataforma 100% brasileira, feita para o mercado local
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Faça Parte da Nossa Comunidade</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de famílias e babás que já confiam na Cuidly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro?type=family">
              <Button size="lg">Cadastrar como Família</Button>
            </Link>
            <Link href="/cadastro?type=nanny">
              <Button size="lg" variant="outline">Cadastrar como Babá</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
