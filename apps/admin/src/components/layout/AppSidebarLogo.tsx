import LogoCuidlyIcon from '@/public/assets/img/favicons/favicon-96.png';
import Image from 'next/image';
import Link from 'next/link';
import LogoCuidly from '../LogoCuidly';
import { SidebarHeader, SidebarMenu, SidebarMenuItem } from '../ui/sidebar';

export default function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <Link
            href="/"
            aria-label="Logo Cuidly"
            className="inline-block flex-none focus:opacity-90 focus:outline-none"
          >
            <Image
              src={LogoCuidlyIcon}
              alt="Logo Cuidly"
              className="block size-8 group-data-[state='expanded']:hidden"
            />

            <LogoCuidly className="hidden w-28 py-1 pl-2 group-data-[state='expanded']:block" />
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
