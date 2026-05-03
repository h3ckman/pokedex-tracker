"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { NavSecondary } from "./nav-secondary";
import { PokemonSidebarNav } from "./pokemon-sidebar-nav";
import { UserMenu } from "./user-menu";
import type { SidebarPokemon } from "./pokemon-grouping";
import type { Role } from "@/lib/generated/prisma/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { MessageCircleQuestionIcon, Settings2Icon } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
};

export function AppSidebar({
  user,
  pokemon,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: Role };
  pokemon: SidebarPokemon[];
}) {
  const pathname = usePathname();

  const navSecondary: NavItem[] = [
    { title: "Settings", url: "/settings", icon: <Settings2Icon /> },
    { title: "Help", url: "/help", icon: <MessageCircleQuestionIcon /> },
  ];
  const filteredSecondary =
    user.role === "ADMIN"
      ? navSecondary
      : navSecondary.filter((i) => i.url !== "/settings");

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="px-2 py-1 text-sm font-medium">Pokédex Tracker</div>
      </SidebarHeader>
      <SidebarContent>
        <PokemonSidebarNav pokemon={pokemon} />
        <SidebarSeparator className="mt-auto" />
        <NavSecondary items={filteredSecondary} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} role={user.role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
