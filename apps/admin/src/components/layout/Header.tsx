import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import Breadcrumb from './Breadcrumb';
import HeaderUser from './HeaderUser';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 mb-4 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb />
      </div>
      <HeaderUser />
    </header>
  );
}
