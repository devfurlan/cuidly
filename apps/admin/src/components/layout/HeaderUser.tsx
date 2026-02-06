import { signOutAction } from '@/app/(auth-pages)/actions';
import { publicFilesUrl } from '@/constants/publicFilesUrl';
import { getCurrentUserWithPermissions } from '@/lib/auth/checkPermission';
import { getUser } from '@/lib/supabase/auth/getUser';
import getInitials from '@/utils/getInitials';
import { LockKeyIcon, SignOutIcon, UserIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export default async function HeaderUser() {
  const user = await getUser();
  const dbUser = await getCurrentUserWithPermissions();
  const userName =
    dbUser?.name || user.user_metadata.full_name || user.email || '';
  const photoUrl = dbUser?.photoUrl
    ? publicFilesUrl(dbUser.photoUrl)
    : user.user_metadata.avatar_url;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="inline-flex items-center justify-center gap-x-2 focus:outline-none">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{userName}</span>
          </div>
          <Avatar className="size-8 shrink-0 rounded-full">
            <AvatarImage src={photoUrl} alt={`Foto: ${userName}`} />
            <AvatarFallback className="bg-fuchsia-200 text-fuchsia-600">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="size-4 shrink-0" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile#change-password">
              <LockKeyIcon className="size-4 shrink-0" />
              Alterar senha
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOutAction}>
          <SignOutIcon className="size-4 shrink-0" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
