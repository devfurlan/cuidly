'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { usePages } from '@/hooks/usePages';
import { SubPagesProps } from '@/@types/pagesMenu';

export default function Breadcrumb() {
  const pathname = usePathname();
  const { pages } = usePages();

  const findBreadcrumb = (
    items: SubPagesProps[],
    currentPath: string,
    path: SubPagesProps[] = [],
  ): SubPagesProps[] => {
    for (const item of items) {
      if (item.url === currentPath) {
        return [...path, item];
      }
      if (item.items) {
        const subPath = findBreadcrumb(item.items, currentPath, [
          ...path,
          item,
        ]);
        if (subPath.length) return subPath;
      }
    }
    return [];
  };

  const breadcrumbItems = findBreadcrumb(
    pages.flatMap((menu) => menu.items),
    pathname,
  );

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.url}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
