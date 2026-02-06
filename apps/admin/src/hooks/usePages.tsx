'use client';

import { useParams, usePathname } from 'next/navigation';
import { isPathnameActual } from '@/utils/isPathnameActual';
import {
  SquaresFourIcon,
  BabyCarriageIcon,
  FirstAidKitIcon,
  UsersIcon,
  HouseIcon,
  NewspaperIcon,
  CrownIcon,
  StarIcon,
  ClockCounterClockwiseIcon,
  TicketIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ChatCircleDotsIcon,
  ChartLineUpIcon,
  FileTextIcon,
  ClipboardTextIcon,
  GearSixIcon,
  FlagIcon,
} from '@phosphor-icons/react';
import { PagesProps, SubPagesProps } from '@/@types/pagesMenu';
import { usePermissions } from '@/contexts/PermissionsContext';

export function usePages() {
  const pathname = usePathname();
  const { id, slug } = useParams();
  const { hasPermission, isSuperAdmin } = usePermissions();

  const pages: PagesProps[] = [
    {
      title: '',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: SquaresFourIcon,
          isActive: isPathnameActual(pathname, '/', true),
          showInMenu: true,
        },
        {
          title: 'Meu Perfil',
          url: '/profile',
          icon: SquaresFourIcon,
          isActive: isPathnameActual(pathname, '/profile', true),
          showInMenu: false,
        },
        {
          title: 'Babás',
          url: '/nannies',
          icon: FirstAidKitIcon,
          isActive: isPathnameActual(pathname, '/nannies'),
          showInMenu: hasPermission('NANNIES'),
          items: [
            {
              title: 'Todas as babás',
              url: '/nannies',
              isActive: isPathnameActual(pathname, '/nannies', true),
              showInMenu: false,
            },
            {
              title: 'Adicionar babá',
              url: '/nannies/create',
              isActive: isPathnameActual(pathname, '/nannies'),
              showInMenu: false,
            },
            {
              title: 'Editar babá',
              url: `/nannies/${slug}/edit`,
              isActive: isPathnameActual(pathname, '/nannies'),
              showInMenu: false,
            },
            {
              title: 'Detalhes da babá',
              url: `/nannies/${slug}`,
              isActive: isPathnameActual(pathname, '/nannies'),
              showInMenu: false,
            },
            {
              title: 'Procurar babás',
              url: '/nannies/find',
              isActive: isPathnameActual(pathname, '/nannies/find', true),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Famílias',
          url: '/families',
          icon: HouseIcon,
          isActive: isPathnameActual(pathname, '/families'),
          showInMenu: hasPermission('FAMILIES'),
          items: [
            {
              title: 'Todas as famílias',
              url: '/families',
              isActive: isPathnameActual(pathname, '/families', true),
              showInMenu: false,
            },
            {
              title: 'Adicionar família',
              url: '/families/create',
              isActive: isPathnameActual(pathname, '/families'),
              showInMenu: false,
            },
            {
              title: 'Editar família',
              url: `/families/${id}/edit`,
              isActive: isPathnameActual(pathname, '/families'),
              showInMenu: false,
            },
            {
              title: 'Detalhes da família',
              url: `/families/${id}`,
              isActive: isPathnameActual(pathname, '/families'),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Crianças',
          url: '/children',
          icon: BabyCarriageIcon,
          isActive: isPathnameActual(pathname, '/children'),
          showInMenu: hasPermission('CHILDREN'),
          items: [
            {
              title: 'Todas as crianças',
              url: '/children',
              isActive: isPathnameActual(pathname, '/children', true),
              showInMenu: false,
            },
            {
              title: 'Adicionar criança',
              url: '/children/create',
              isActive: isPathnameActual(pathname, '/children'),
              showInMenu: false,
            },
            {
              title: 'Editar criança',
              url: `/children/${id}/edit`,
              isActive: isPathnameActual(pathname, '/children'),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Vagas',
          url: '/jobs',
          icon: BriefcaseIcon,
          isActive: isPathnameActual(pathname, '/jobs'),
          showInMenu: hasPermission('JOBS'),
          items: [
            {
              title: 'Todas as vagas',
              url: '/jobs',
              isActive: isPathnameActual(pathname, '/jobs', true),
              showInMenu: false,
            },
            {
              title: 'Detalhes da vaga',
              url: `/jobs/${id}`,
              isActive: isPathnameActual(pathname, '/jobs'),
              showInMenu: false,
            },
            {
              title: 'Editar vaga',
              url: `/jobs/${id}/edit`,
              isActive: isPathnameActual(pathname, '/jobs'),
              showInMenu: false,
            },
          ],
        },
      ],
    },
    {
      title: 'Assinaturas',
      items: [
        {
          title: 'Planos',
          url: '/plans',
          icon: CrownIcon,
          isActive: isPathnameActual(pathname, '/plans', true),
          showInMenu: hasPermission('SUBSCRIPTIONS'),
        },
        {
          title: 'Cupons',
          url: '/coupons',
          icon: TicketIcon,
          isActive: isPathnameActual(pathname, '/coupons'),
          showInMenu: hasPermission('COUPONS'),
          items: [
            {
              title: 'Todos os cupons',
              url: '/coupons',
              isActive: isPathnameActual(pathname, '/coupons', true),
              showInMenu: false,
            },
            {
              title: 'Adicionar cupom',
              url: '/coupons/create',
              isActive: isPathnameActual(pathname, '/coupons/create'),
              showInMenu: false,
            },
            {
              title: 'Editar cupom',
              url: `/coupons/${id}/edit`,
              isActive: isPathnameActual(pathname, '/coupons'),
              showInMenu: false,
            },
            {
              title: 'Detalhes do cupom',
              url: `/coupons/${id}`,
              isActive: isPathnameActual(pathname, '/coupons'),
              showInMenu: false,
            },
          ],
        },
      ],
    },
    {
      title: 'Moderação',
      items: [
        {
          title: 'Avaliações',
          url: '/reviews',
          icon: StarIcon,
          isActive: isPathnameActual(pathname, '/reviews', true),
          showInMenu: hasPermission('REVIEWS'),
        },
        {
          title: 'Histórico',
          url: '/reviews/historico',
          icon: ClockCounterClockwiseIcon,
          isActive: isPathnameActual(pathname, '/reviews/historico'),
          showInMenu: hasPermission('REVIEWS'),
        },
        {
          title: 'Validações',
          url: '/validations',
          icon: ShieldCheckIcon,
          isActive: isPathnameActual(pathname, '/validations'),
          showInMenu: hasPermission('VALIDATIONS'),
          items: [
            {
              title: 'Todas as validações',
              url: '/validations',
              isActive: isPathnameActual(pathname, '/validations', true),
              showInMenu: false,
            },
            {
              title: 'Revisar validação',
              url: `/validations/${id}`,
              isActive: isPathnameActual(pathname, '/validations'),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Chat',
          url: '/moderation/chat',
          icon: ChatCircleDotsIcon,
          isActive: isPathnameActual(pathname, '/moderation/chat'),
          showInMenu: hasPermission('CHAT_MODERATION'),
          items: [
            {
              title: 'Moderação de Chat',
              url: '/moderation/chat',
              isActive: isPathnameActual(pathname, '/moderation/chat', true),
              showInMenu: false,
            },
            {
              title: 'Visualizar conversa',
              url: `/moderation/chat/${id}`,
              isActive: isPathnameActual(pathname, '/moderation/chat'),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Denúncias',
          url: '/denuncias',
          icon: FlagIcon,
          isActive: isPathnameActual(pathname, '/denuncias'),
          showInMenu: hasPermission('REPORTS'),
        },
      ],
    },
    {
      title: 'Inteligência',
      items: [
        {
          title: 'Analytics',
          url: '/analytics',
          icon: ChartLineUpIcon,
          isActive: isPathnameActual(pathname, '/analytics'),
          showInMenu: hasPermission('SUBSCRIPTIONS'),
        },
        {
          title: 'Relatórios',
          url: '/reports',
          icon: FileTextIcon,
          isActive: isPathnameActual(pathname, '/reports'),
          showInMenu: hasPermission('SUBSCRIPTIONS'),
        },
      ],
    },
    {
      title: 'Blog',
      items: [
        {
          title: 'Posts',
          url: '/posts',
          icon: NewspaperIcon,
          isActive: isPathnameActual(pathname, '/posts', true),
          showInMenu: true,
        },
      ],
    },
    {
      title: 'Administração',
      items: [
        {
          title: 'Usuários',
          url: '/admin-users',
          icon: UsersIcon,
          isActive: isPathnameActual(pathname, '/admin-users'),
          showInMenu: hasPermission('ADMIN_USERS'),
          items: [
            {
              title: 'Todos os administradores',
              url: '/admin-users',
              isActive: isPathnameActual(pathname, '/admin-users', true),
              showInMenu: false,
            },
            {
              title: 'Adicionar administrador',
              url: '/admin-users/create',
              isActive: isPathnameActual(pathname, '/admin-users'),
              showInMenu: false,
            },
            {
              title: 'Editar administrador',
              url: `/admin-users/${id}/edit`,
              isActive: isPathnameActual(pathname, '/admin-users'),
              showInMenu: false,
            },
          ],
        },
        {
          title: 'Logs de Auditoria',
          url: '/audit-logs',
          icon: ClipboardTextIcon,
          isActive: isPathnameActual(pathname, '/audit-logs'),
          showInMenu: isSuperAdmin,
        },
        {
          title: 'Configurações',
          url: '/settings',
          icon: GearSixIcon,
          isActive: isPathnameActual(pathname, '/settings'),
          showInMenu: isSuperAdmin,
        },
      ],
    },
  ];

  const filterMenuItems = (items: SubPagesProps[]): SubPagesProps[] => {
    return items
      .filter((item) => item.showInMenu)
      .map((item) => ({
        ...item,
        items: item.items ? filterMenuItems(item.items) : [],
      }))
      .filter((item) => item.items.length > 0 || item.showInMenu);
  };

  const pagesMenu: PagesProps[] = pages
    .map((page) => ({
      title: page.title,
      items: filterMenuItems(page.items),
    }))
    .filter((page) => page.items.length > 0);
  return { pagesMenu, pages };
}
