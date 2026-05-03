"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  ArrowDownAZIcon,
  BookIcon,
  GamepadIcon,
  MapIcon,
  SearchIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PokemonFolderList } from "./pokemon-folder-list";
import type { SidebarPokemon, ViewMode } from "./pokemon-grouping";

const STORAGE_KEY = "pokemon-sidebar:view-mode";
const DEFAULT_MODE: ViewMode = "region";

const MODES: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: "pokedex", label: "Pokédex", icon: <BookIcon /> },
  {
    value: "alphabetical",
    label: "Alphabetical",
    icon: <ArrowDownAZIcon />,
  },
  { value: "region", label: "Region", icon: <MapIcon /> },
  { value: "game-system", label: "Game System", icon: <GamepadIcon /> },
];

function isViewMode(value: string): value is ViewMode {
  return (
    value === "pokedex" ||
    value === "alphabetical" ||
    value === "region" ||
    value === "game-system"
  );
}

function useActiveDex(): number | null {
  const pathname = usePathname();
  const match = pathname.match(/^\/pokemon\/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function PokemonSidebarNav({
  pokemon,
}: {
  pokemon: SidebarPokemon[];
}) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(DEFAULT_MODE);
  const [search, setSearch] = React.useState("");
  const activeDex = useActiveDex();

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isViewMode(stored)) {
      setViewMode(stored);
    }
  }, []);

  const updateViewMode = React.useCallback((next: ViewMode) => {
    setViewMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <SidebarGroup className="gap-2">
      <ToggleGroup
        value={[viewMode]}
        onValueChange={(values) => {
          const next = values[0];
          if (next && isViewMode(next)) updateViewMode(next);
        }}
        variant="outline"
        size="sm"
        className="grid w-full grid-cols-4"
      >
        {MODES.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={mode.value}
                  aria-label={mode.label}
                  className="w-full"
                >
                  {mode.icon}
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="bottom">{mode.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <SidebarInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Pokémon..."
          className="pl-7"
          aria-label="Search Pokémon"
        />
      </div>

      <SidebarGroupContent>
        <PokemonFolderList
          pokemon={pokemon}
          viewMode={viewMode}
          search={search}
          activeDex={activeDex}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
