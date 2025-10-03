'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  CalendarCheck,
  FilePlus,
  History,
  LayoutDashboard,
  LogOut,
  Target,
} from 'lucide-react';

import { logout } from '@/lib/actions';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-16 items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Box className="size-6 text-sidebar-primary" />
          <div className="text-lg font-semibold text-sidebar-foreground">Unicube</div>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {user.role === 'admin' && (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton
                asChild
                isActive={pathname === '/attendance'}
                tooltip={{ children: 'Attendance' }}
              >
                <Link href="/attendance">
                  <CalendarCheck />
                  <span>Attendance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/goals'}
                tooltip={{ children: 'Goals' }}
              >
                <Link href="/goals">
                  <Target />
                  <span>Goals</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/apply-leave'}
            tooltip={{ children: 'Apply for Leave' }}
          >
            <Link href="/apply-leave">
              <FilePlus />
              <span>Apply for Leave</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/my-requests'}
            tooltip={{ children: 'My Requests' }}
          >
            <Link href="/my-requests">
              <History />
              <span>My Requests</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
          </div>
        </div>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => logout()} tooltip={{ children: 'Logout' }}>
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
