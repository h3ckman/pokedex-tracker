"use client";

import Link from "next/link";
import { ChevronUpIcon, LogOutIcon, ShieldIcon, UsersIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/generated/prisma/client";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  SITE_MANAGER: "Site Manager",
  TECHNICIAN: "Technician",
  VIEWER: "Viewer",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({
  user,
  role,
}: {
  user: { name: string; email: string };
  role: Role;
}) {
  const isAdmin = role === "ADMIN";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton className="h-12" />}>
            <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
              {initials(user.name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {ROLE_LABEL[role]}
              </span>
            </div>
            <ChevronUpIcon className="opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="top"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {isAdmin && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={<Link href="/settings/users" />}
                    className="gap-2"
                  >
                    <UsersIcon className="size-4" />
                    Manage users
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/settings/audit" />}
                    className="gap-2"
                  >
                    <ShieldIcon className="size-4" />
                    Audit log
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <form action={logoutAction}>
                <DropdownMenuItem
                  nativeButton={true}
                  render={<button type="submit" className="w-full text-left" />}
                  className="gap-2"
                >
                  <LogOutIcon className="size-4" />
                  Log out
                </DropdownMenuItem>
              </form>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
