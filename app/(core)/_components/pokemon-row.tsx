"use client";

import Link from "next/link";

import { Pokeball } from "@/components/icons/pokeball";
import { SidebarMenuSubButton } from "@/components/ui/sidebar";
import type { SidebarPokemon } from "./pokemon-grouping";

function pad4(n: number): string {
  return String(n).padStart(4, "0");
}

export function PokemonRow({
  pokemon,
  isActive,
}: {
  pokemon: SidebarPokemon;
  isActive: boolean;
}) {
  const href = `/pokemon/${pokemon.nationalDexNumber}`;
  return (
    <SidebarMenuSubButton
      isActive={isActive}
      render={<Link href={href} prefetch={false} />}
      className="h-8 gap-2"
    >
      {pokemon.spriteUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pokemon.spriteUrl}
          alt=""
          className="size-6 shrink-0"
          loading="lazy"
        />
      ) : (
        <Pokeball className="size-5 shrink-0" />
      )}
      <span className="text-muted-foreground tabular-nums text-xs">
        #{pad4(pokemon.nationalDexNumber)}
      </span>
      <span className="truncate">{pokemon.name}</span>
    </SidebarMenuSubButton>
  );
}
