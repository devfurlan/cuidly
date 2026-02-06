import LogoCuidly from '@/components/LogoCuidly';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-center border-b border-b-gray-200 bg-white px-8 py-8">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <LogoCuidly height={32} />
        </Link>
      </header>
      <div className="flex min-h-svh w-full items-center justify-center overflow-y-auto pt-28 pb-8">
        <main className="mx-auto w-full max-w-md px-6">{children}</main>
      </div>
    </>
  );
}
