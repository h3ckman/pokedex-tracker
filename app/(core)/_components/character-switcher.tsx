"use client";

import Link from "next/link";
import { useTransition } from "react";
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
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  Swords,
  UserIcon,
} from "lucide-react";
import { selectCharacter } from "@/lib/actions/characters";

export type CharacterSummary = {
  id: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
};

export function CharacterSwitcher({
  characters,
  activeId,
}: {
  characters: CharacterSummary[];
  activeId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const active = characters.find((c) => c.id === activeId) ?? characters[0] ?? null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton className="w-fit px-1.5" />}
          >
            <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Swords className="size-3.5" />
            </div>
            <span className="truncate font-medium">
              {active ? active.name : "No character"}
            </span>
            <ChevronDownIcon className="opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your characters
              </DropdownMenuLabel>
              {characters.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No characters yet.
                </div>
              ) : (
                characters.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    className="gap-2 p-2"
                    disabled={pending}
                    onClick={() => {
                      startTransition(() => {
                        void selectCharacter(c.id);
                      });
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-xs border">
                      <UserIcon className="size-3.5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {c.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Lvl {c.level} {c.race} {c.characterClass}
                      </span>
                    </div>
                    {c.id === active?.id && (
                      <CheckIcon className="ml-auto size-4 opacity-70" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              nativeButton={false}
              render={<Link href="/characters" />}
            >
              <div className="flex size-6 items-center justify-center rounded-xs border">
                <PlusIcon className="size-3.5" />
              </div>
              <span className="text-sm">Manage characters</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
