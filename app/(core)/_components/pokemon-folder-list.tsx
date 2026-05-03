"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { PokemonRow } from "./pokemon-row";
import {
  filterPokemon,
  groupPokemon,
  type SidebarPokemon,
  type ViewMode,
} from "./pokemon-grouping";

export function PokemonFolderList({
  pokemon,
  viewMode,
  search,
  activeDex,
}: {
  pokemon: SidebarPokemon[];
  viewMode: ViewMode;
  search: string;
  activeDex: number | null;
}) {
  const [userOpenSet, setUserOpenSet] = React.useState<Record<string, boolean>>(
    {},
  );

  if (pokemon.length === 0) {
    return (
      <div className="px-2 py-3 text-xs text-sidebar-foreground/60">
        No Pokémon yet — run{" "}
        <code className="font-mono">npx prisma db seed</code>.
      </div>
    );
  }

  const filtered = filterPokemon(pokemon, search);
  const groups = groupPokemon(filtered, viewMode).filter(
    (g) => g.pokemon.length > 0,
  );
  const searching = search.trim().length > 0;

  if (groups.length === 0) {
    return (
      <div className="px-2 py-3 text-xs text-sidebar-foreground/60">
        No matches for &ldquo;{search}&rdquo;.
      </div>
    );
  }

  return (
    <SidebarMenu className="gap-0.5">
      {groups.map((group) => {
        const open = searching ? true : (userOpenSet[group.key] ?? false);
        return (
          <Collapsible
            key={group.key}
            open={open}
            onOpenChange={(next) => {
              if (searching) return;
              setUserOpenSet((prev) => ({ ...prev, [group.key]: next }));
            }}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton className="group/folder pr-8">
                    <ChevronRightIcon className="transition-transform duration-150 group-data-[panel-open]/folder:rotate-90" />
                    <span className="truncate">{group.label}</span>
                  </SidebarMenuButton>
                }
              />
              <SidebarMenuBadge className="tabular-nums">
                {group.pokemon.length}
              </SidebarMenuBadge>
              <CollapsibleContent>
                <SidebarMenuSub className="mr-0 gap-0.5 pr-0">
                  {group.pokemon.map((p) => (
                    <SidebarMenuSubItem key={`${group.key}:${p.id}`}>
                      <PokemonRow
                        pokemon={p}
                        isActive={p.nationalDexNumber === activeDex}
                      />
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}
