import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-2xl font-bold">404 - Página não encontrada</h2>
      <p className="mb-4 text-gray-600">A página que você está procurando não existe.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Voltar para o início
      </Link>
    </div>
  );
}
