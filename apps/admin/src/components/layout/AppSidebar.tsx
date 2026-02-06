'use client';

import * as React from 'react';
import { AppSidebarMenu } from '@/components/layout/AppSidebarMenu';
import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import AppSidebarHeader from './AppSidebarLogo';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarHeader />
      <SidebarContent>
        <AppSidebarMenu />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
