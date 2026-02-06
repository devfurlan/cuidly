import { Icon } from '@phosphor-icons/react';

export interface SubPagesProps {
  title: string;
  url: string;
  icon?: Icon;
  isActive: boolean;
  showInMenu?: boolean;
  items?: SubPagesProps[];
}

export interface PagesProps {
  title: string;
  items: SubPagesProps[];
}
