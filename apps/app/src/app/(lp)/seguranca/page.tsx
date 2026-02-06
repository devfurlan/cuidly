import { PiCheckCircle, PiFileText, PiLock, PiShieldCheck, PiUsers } from 'react-icons/pi';
import { Card } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';

export default function SegurancaPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <PiShieldCheck className="w-20 h-20 text-pink mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Segurança em Primeiro Lugar</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todas as babás passam por um rigoroso processo de validação
            antes de serem aprovadas na plataforma.
          </p>
        </div>

        {/* Processo de Validação */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Processo de Validação
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PiFileText className="w-6 h-6 text-pink" />
              </div>
              <h3 className="font-bold mb-2">1. Documentação</h3>
              <p className="text-gray-600 text-sm">
                Verificação de identidade (RG/CPF), comprovante de residência
                e certificados profissionais.
              </p>
            </Card>

            <Card className="p-6">
              <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PiShieldCheck className="w-6 h-6 text-pink" />
              </div>
              <h3 className="font-bold mb-2">2. Antecedentes Criminais</h3>
              <p className="text-gray-600 text-sm">
                Consulta em bases de dados federais, estaduais e municipais
                para verificar histórico criminal.
              </p>
            </Card>

            <Card className="p-6">
              <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PiUsers className="w-6 h-6 text-pink" />
              </div>
              <h3 className="font-bold mb-2">3. Referências</h3>
              <p className="text-gray-600 text-sm">
                Contato com pelo menos 2 referências profissionais anteriores
                para validar experiência.
              </p>
            </Card>

            <Card className="p-6">
              <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PiCheckCircle className="w-6 h-6 text-pink" />
              </div>
              <h3 className="font-bold mb-2">4. Aprovação</h3>
              <p className="text-gray-600 text-sm">
                Após aprovação em todas as etapas, a babá recebe o
                Selo de Verificação.
              </p>
            </Card>
          </div>
        </div>

        {/* Níveis de Validação */}
        <div className="bg-gray-50 -mx-4 px-4 py-16 md:mx-0 md:rounded-lg mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Níveis de Validação
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Selo Identificada */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <PiShieldCheck className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold">Selo Identificada</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Cuidly Básico (Grátis)</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Perfil completo</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Documento validado (RG/CNH)</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm">E-mail verificado</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Candidatar-se a vagas</span>
                </li>
              </ul>
            </Card>

            {/* Selo Verificada */}
            <Card className="p-8 border-2 border-pink">
              <div className="flex items-center gap-3 mb-4">
                <PiShieldCheck className="w-8 h-8 text-pink" />
                <h3 className="text-2xl font-bold">Selo Verificada</h3>
              </div>
              <p className="text-sm text-pink font-semibold mb-4">Cuidly Pro (a partir de R$ 12,90/mês)</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                  <span className="text-sm">Tudo do Selo Identificada</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                  <span className="text-sm">Validação facial (selfie vs documento)</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                  <span className="text-sm">Antecedentes criminais (background check)</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                  <span className="text-sm">Mensagens ilimitadas após candidatura</span>
                </li>
                <li className="flex items-start gap-2">
                  <PiCheckCircle className="w-5 h-5 text-pink shrink-0 mt-0.5" />
                  <span className="text-sm">Perfil em destaque</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Proteção de Dados */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Proteção de Dados
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <PiLock className="w-12 h-12 text-pink mx-auto mb-4" />
              <h3 className="font-bold mb-2">Criptografia SSL</h3>
              <p className="text-gray-600 text-sm">
                Todos os dados são transmitidos com criptografia de ponta a ponta
              </p>
            </Card>

            <Card className="p-6 text-center">
              <PiShieldCheck className="w-12 h-12 text-pink mx-auto mb-4" />
              <h3 className="font-bold mb-2">LGPD Compliance</h3>
              <p className="text-gray-600 text-sm">
                Seguimos rigorosamente a Lei Geral de Proteção de Dados
              </p>
            </Card>

            <Card className="p-6 text-center">
              <PiFileText className="w-12 h-12 text-pink mx-auto mb-4" />
              <h3 className="font-bold mb-2">Dados Seguros</h3>
              <p className="text-gray-600 text-sm">
                Armazenamento em servidores seguros com backup diário
              </p>
            </Card>
          </div>
        </div>

        {/* Garantias */}
        <div className="bg-linear-to-br from-pink-50 to-purple-50 -mx-4 px-4 py-16 md:mx-0 md:rounded-lg mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossas Garantias
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <PiCheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">100% das babás são verificadas</h3>
                  <p className="text-gray-600 text-sm">
                    Nenhuma babá é aprovada sem passar pelo processo completo de validação
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <PiCheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Suporte dedicado</h3>
                  <p className="text-gray-600 text-sm">
                    Nossa equipe está disponível para ajudar em caso de qualquer problema
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <PiCheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Transparência total</h3>
                  <p className="text-gray-600 text-sm">
                    Você tem acesso completo ao status de validação de cada babá
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronta para contratar com segurança?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Cadastre-se grátis e tenha acesso a babás 100% verificadas
          </p>
          <Link href="/cadastro?type=family">
            <Button size="lg">Começar Agora</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
