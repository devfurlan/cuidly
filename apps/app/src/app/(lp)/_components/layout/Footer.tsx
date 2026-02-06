import LogoCuidly from '@/components/LogoCuidly';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { PiEnvelope } from 'react-icons/pi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Sobre */}
          <div>
            <div className="mb-4">
              <LogoCuidly color="white" height={32} />
            </div>
            <p className="text-sm">
              O marketplace que conecta famílias a babás qualificadas com
              segurança e tecnologia.
            </p>
          </div>

          {/* Para Famílias */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Para Famílias</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/como-funciona"
                  className="transition hover:text-white"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/seguranca" className="transition hover:text-white">
                  Segurança
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro?type=family"
                  className="transition hover:text-white"
                >
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Babás */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Para Babás</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/babas" className="transition hover:text-white">
                  Por que se cadastrar
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro?type=nanny"
                  className="transition hover:text-white"
                >
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/quem-somos"
                  className="transition hover:text-white"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="transition hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/termos/termos-de-uso"
                  className="transition hover:text-white"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/termos/politica-de-privacidade"
                  className="transition hover:text-white"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos/politica-de-cookies"
                  className="transition hover:text-white"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm">
            © {new Date().getFullYear()} Cuidly Tecnologia Ltda · CNPJ 63.813.138/0001-20
          </p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <a
              href="https://www.instagram.com/cuidlybr"
              target="_blank"
              className="transition hover:text-white"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/cuidlybr"
              target="_blank"
              className="transition hover:text-white"
            >
              <FaFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/company/cuidly"
              target="_blank"
              className="transition hover:text-white"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:contato@cuidly.com"
              className="transition hover:text-white"
            >
              <PiEnvelope className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
