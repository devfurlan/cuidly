'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePages } from '@/hooks/usePages';

export function AppSidebarMenu() {
  const { state } = useSidebar();
  const { pagesMenu } = usePages();

  return (
    <>
      {pagesMenu.map((section, sectionIndex) => (
        <SidebarGroup key={sectionIndex}>
          {section.title && (
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          )}
          <SidebarMenu>
            {section.items.map((item, itemIndex) => (
              <Fragment key={itemIndex}>
                {item.items?.length === 0 ? (
                  <SidebarMenuItem key={itemIndex}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={item.isActive}
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <Collapsible
                    key={itemIndex}
                    defaultOpen={item.isActive}
                    className="group/collapsible"
                    asChild
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        {state === 'expanded' ? (
                          <SidebarMenuButton
                            tooltip={item.title}
                            className="flex items-center gap-2 text-gray-800 dark:text-neutral-200"
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={item.isActive}
                            className="flex items-center gap-2 text-gray-800 dark:text-neutral-200"
                          >
                            <Link href={item.url}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.isActive}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}
              </Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
