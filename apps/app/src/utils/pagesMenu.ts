import { scrollTo } from './scrollTo';

export const pagesMenu = [
  {
    name: 'Para Famílias',
    href: '/',
  },
  {
    name: 'Para Babás',
    href: '/seja-baba',
  },
  {
    name: 'Quem Somos',
    href: '/#sobre',
    onClick: scrollTo,
  },
  {
    name: 'Blog',
    href: '/blog',
  },
];
