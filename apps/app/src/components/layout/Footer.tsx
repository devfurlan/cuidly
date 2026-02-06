import { pagesMenu } from '@/utils/pagesMenu';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import LogoCuidly from '../LogoCuidly';

export default function Footer() {
  return (
    <footer className="bg-pink py-7">
      <div className="container mx-auto flex justify-between gap-8 px-4 pb-7">
        <div className="flex flex-1 items-center justify-between lg:flex-none lg:flex-col lg:items-start lg:gap-6">
          <LogoCuidly color="white" height={32} />
          <div className="flex items-center justify-end gap-6">
            <a href="https://www.instagram.com/cuidlybr" target="_blank">
              <FaInstagram size={20} color="rgb(209 213 219)" />
            </a>
            <a href="https://www.facebook.com/cuidlybr" target="_blank">
              <FaFacebook size={20} color="rgb(209 213 219)" />
            </a>
            <a href="https://linkedin.com/company/cuidly" target="_blank">
              <FaLinkedin size={20} color="rgb(209 213 219)" />
            </a>
          </div>
        </div>
        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {pagesMenu.map((page, index) => (
            <Link
              key={index}
              href={page.href}
              className="border-b-pink border-b-2 font-medium text-fuchsia-200 hover:border-b-fuchsia-50 hover:text-fuchsia-50"
            >
              {page.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="container mx-auto border-t border-gray-200 px-4 pt-5">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-x-4 text-sm">
              <Link
                className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 focus:text-gray-200 focus:outline-hidden"
                href="/termos/termos-de-uso"
              >
                Termos de uso
              </Link>
              <Link
                className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 focus:text-gray-200 focus:outline-hidden"
                href="/termos/politica-de-privacidade"
              >
                Política de privacidade
              </Link>
              <Link
                className="inline-flex gap-x-2 text-gray-400 hover:text-gray-200 focus:text-gray-200 focus:outline-hidden"
                href="/termos/politica-de-cookies"
              >
                Política de cookies
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-x-4 text-center text-xs text-gray-300 md:text-right">
              ©{new Date().getFullYear()} Cuidly Tecnologia Ltda | CNPJ:
              63.813.138/0001-20 <br /> Alameda Rio Negro, 503 - Sala 2020 -
              Alphaville Industrial, Barueri/SP - CEP 06454-000
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
