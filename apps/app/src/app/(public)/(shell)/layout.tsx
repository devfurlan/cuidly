import LPShell from '@/app/(public)/_components/layout/LPShell';

export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LPShell>{children}</LPShell>;
}
