"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowsExchange,
  IconHome,
  IconPackages,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export type SidebarUser = {
  name: string;
  email: string;
  image: string | null;
  role: "ADMIN" | "USER";
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  const navItems: NavItem[] = [
    { title: "Dashboard", url: "/home", icon: <IconHome /> },
    { title: "Transactions", url: "/transactions", icon: <IconArrowsExchange /> },
    { title: "Masters", url: "/masters", icon: <IconPackages /> },
  ];

  if (user.role === "ADMIN") {
    navItems.push({ title: "Users", url: "/users", icon: <IconUsers /> });
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              tooltip='dRoots0'
              render={<Link href='/home' />}
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <IconPackages className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>dRoots0</span>
                <span className='truncate text-xs text-muted-foreground'>Inventory</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
